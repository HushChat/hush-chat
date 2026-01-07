package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.readstatus.dto.MessageReadStatusWSResponseDTO;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.attachment.repository.MessageAttachmentRepository;
import com.platform.software.chat.message.dto.MessageUnsentWSResponseDTO;
import com.platform.software.chat.message.dto.MessageReactionWSResponseDTO;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.entity.ReactionTypeEnum;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.notification.entity.DeviceType;
import com.platform.software.chat.user.service.UserUtilService;
import com.platform.software.common.constants.WebSocketTopicConstants;
import com.platform.software.common.model.MediaPathEnum;
import com.platform.software.common.model.MediaSizeEnum;
import com.platform.software.common.model.MessageReactionActionEnum;
import com.platform.software.config.aws.CloudPhotoHandlingService;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import com.platform.software.config.workspace.WorkspaceContext;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
public class MessagePublisherService {

    private final ConversationUtilService conversationUtilService;
    private final WebSocketSessionManager webSocketSessionManager;
    private final MessageAttachmentRepository messageAttachmentRepository;
    private final CloudPhotoHandlingService cloudPhotoHandlingService;

    public MessagePublisherService(
            ConversationUtilService conversationUtilService,
            WebSocketSessionManager webSocketSessionManager,
            MessageAttachmentRepository messageAttachmentRepository,
            CloudPhotoHandlingService cloudPhotoHandlingService) {
        this.conversationUtilService = conversationUtilService;
        this.webSocketSessionManager = webSocketSessionManager;
        this.messageAttachmentRepository = messageAttachmentRepository;
        this.cloudPhotoHandlingService = cloudPhotoHandlingService;
    }

    /**
     * Invoke new message to participants.
     *
     * @param conversationId the conversation id
     * @param messageViewDTO the message view dto
     * @param senderId       the sender id
     * @param workspaceId    the tenant id
     */
    @Transactional(readOnly = true)
    public void invokeNewMessageToParticipants(Long conversationId, MessageViewDTO messageViewDTO, Long senderId,
            String workspaceId) {
        ConversationDTO conversationDTO = conversationUtilService.getConversationDTOOrThrow(senderId, conversationId);

        ConversationParticipantViewDTO senderParticipant = conversationDTO.getParticipants().stream()
                .filter(p -> p.getUser().getId().equals(senderId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Sender not found in conversation participant list"));;

        // when sending ws message, conversation name need to be named of the message
        // sender for non group conversations
        UserUtilService.setConversationNameForNonGroup(senderId, conversationDTO, true);

        // TODO: This is a quick fix, refactor this later
        List<MessageAttachmentDTO> attachmentDTOs = messageAttachmentRepository.findByMessageId(messageViewDTO.getId())
                .stream()
                .map(attachment -> {
                    MessageAttachmentDTO messageAttachmentDTO = new MessageAttachmentDTO(attachment);

                    String fileViewSignedURL = cloudPhotoHandlingService
                            .getPhotoViewSignedURL(attachment.getIndexedFileName());

                    messageAttachmentDTO.setFileUrl(fileViewSignedURL);

                    return messageAttachmentDTO;
                })
                .toList();
        messageViewDTO.setConversationId(conversationId);

        if (!attachmentDTOs.isEmpty()) {
            messageViewDTO.setHasAttachment(true);
        }
        messageViewDTO.setMessageAttachments(attachmentDTOs);

        conversationDTO.setMessages(List.of(messageViewDTO));

        DeviceType deviceType = webSocketSessionManager.getUserDeviceType(
                WorkspaceContext.getCurrentWorkspace(),
                senderParticipant.getUser().getEmail()
        );
        conversationDTO.setDeviceType(deviceType);

        conversationDTO.getParticipants().stream()
                .filter(p -> p.getUser() != null && p.getUser().getId() != null)
                .filter(p -> !p.getUser().getId().equals(senderId))
                .forEach(participant -> {
                    String email = participant.getUser().getEmail();
                    if (email == null)
                        return;

                    ConversationDTO payload = getConversationDTO(participant, conversationDTO);

                    payload.setSignedImageUrl(cloudPhotoHandlingService.getPhotoViewSignedURL(
                            payload.getIsGroup() ? MediaPathEnum.RESIZED_GROUP_PICTURE : MediaPathEnum.RESIZED_PROFILE_PICTURE,
                            MediaSizeEnum.MEDIUM,
                            payload.getImageIndexedName())
                    );

                    webSocketSessionManager.sendMessageToUser(
                            workspaceId,
                            email,
                            WebSocketTopicConstants.MESSAGE_RECEIVED,
                            payload);
                });
    }

    private static ConversationDTO getConversationDTO(ConversationParticipantViewDTO participant,
            ConversationDTO conversationDTO) {
        ConversationDTO participantDTO = new ConversationDTO(conversationDTO);

        participantDTO.setPinnedByLoggedInUser(participant.getIsPinnedByParticipant());
        participantDTO.setArchivedByLoggedInUser(participant.getIsArchivedByParticipant());
        participantDTO.setMutedByLoggedInUser(participant.getIsMutedByParticipant());
        participantDTO.setFavoriteByLoggedInUser(participant.getIsFavoriteByParticipant());

        // Remove participant details to minimize WebSocket payload size
        participantDTO.setParticipants(null);
        return participantDTO;
    }

    /**
     * Notify conversation participants in real time when a message is unsent.
     * <p>
     * The user who initiated the unsent action (actor) is explicitly excluded
     * from receiving the WebSocket event, as their UI state is already updated
     * locally.
     *
     * @param conversationId the conversation ID where the message was unsent
     * @param messageId      the unsent message ID
     * @param actorUserId    the user ID who initiated the unsent action
     * @param workspaceId    the workspace (tenant) identifier
     */
    @Async
    @Transactional(readOnly = true)
    public void invokeMessageUnsentToParticipants(
            Long conversationId,
            Long messageId,
            Long actorUserId,
            String workspaceId) {
        MessageUnsentWSResponseDTO payload = new MessageUnsentWSResponseDTO(conversationId, messageId, actorUserId);

        ConversationDTO conversationDTO = conversationUtilService.getConversationDTOOrThrow(actorUserId,
                conversationId);

        conversationDTO.getParticipants().stream()
                .filter(p -> p.getUser() != null && p.getUser().getId() != null)
                .filter(p -> !p.getUser().getId().equals(actorUserId))
                .map(p -> p.getUser().getEmail())
                .filter(email -> email != null && !email.isBlank())
                .forEach(email -> {
                    webSocketSessionManager.sendMessageToUser(
                            workspaceId,
                            email,
                            WebSocketTopicConstants.MESSAGE_UNSENT,
                            payload);
                });
    }

    /**
     * Notify conversation participants in real time when a message reaction is
     * added,
     * updated, or removed.
     * <p>
     * The user who initiated the reaction action (actor) is explicitly excluded
     * from receiving the WebSocket event, as their UI state is already updated
     * locally.
     *
     * @param conversationId       the conversation ID where the reaction occurred
     * @param messageId            the message ID on which the reaction was applied
     * @param actorUserId          the user ID who performed the reaction action
     * @param reactionType         the current reaction type (e.g., 👍, ❤️), may be
     *                             null on removal
     * @param previousReactionType the previous reaction type before the action, if
     *                             any
     * @param action               the reaction action type (ADD, UPDATE, REMOVE)
     * @param workspaceId          the workspace (tenant) identifier
     */
    @Async
    @Transactional(readOnly = true)
    public void invokeMessageReactionToParticipants(
            Long conversationId,
            Long messageId,
            Long actorUserId,
            ReactionTypeEnum reactionType,
            ReactionTypeEnum previousReactionType,
            MessageReactionActionEnum reactionAction,
            String workspaceId) {
        MessageReactionWSResponseDTO payload = new MessageReactionWSResponseDTO(
                conversationId,
                messageId,
                actorUserId,
                reactionType,
                previousReactionType,
                reactionAction
        );

        List<ChatUser> participants = conversationUtilService.getAllActiveParticipantsExceptSender(conversationId,
                actorUserId);

        participants.stream()
                .filter(p -> p.getId() != null)
                .map(ChatUser::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .forEach(email -> webSocketSessionManager.sendMessageToUser(
                        workspaceId,
                        email,
                        WebSocketTopicConstants.MESSAGE_REACTION,
                        payload));
    }

    /**
     * Notify conversation participants in real time when a message is marked as
     * read/seen.
     * <p>
     * The user who marked the message as read (actor) is explicitly excluded from
     * receiving the WebSocket event, as their UI state is already updated locally.
     *
     * @param workspaceId       the workspace (tenant) identifier
     * @param conversationId    the conversation ID where the message was read
     * @param actorUserId       the user ID who marked the message as read
     * @param lastSeenMessageId the ID of the last seen/read message
     */
    @Async
    @Transactional(readOnly = true)
    public void invokeMessageReadStatusToParticipants(
            String workspaceId,
            Long conversationId,
            Long actorUserId,
            Long lastSeenMessageId
    ) {
        List<ChatUser> participants = conversationUtilService.getAllActiveParticipantsExceptSender(conversationId,
                actorUserId);

        MessageReadStatusWSResponseDTO payload = new MessageReadStatusWSResponseDTO(conversationId, lastSeenMessageId);

        participants.stream()
                .filter(p -> p.getId() != null)
                .map(ChatUser::getEmail)
                .filter(email -> email != null && !email.isBlank())
                .forEach(email -> webSocketSessionManager.sendMessageToUser(
                        workspaceId,
                        email,
                        WebSocketTopicConstants.MESSAGE_READ,
                        payload));
    }
}
