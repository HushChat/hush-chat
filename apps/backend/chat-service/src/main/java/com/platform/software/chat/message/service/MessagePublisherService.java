package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.attachment.repository.MessageAttachmentRepository;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.user.service.UserUtilService;
import com.platform.software.config.aws.CloudPhotoHandlingService;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class MessagePublisherService {
    private final String MESSAGE_INVOKE_PATH = "/topic/message-received";

    private final ConversationUtilService conversationUtilService;
    private final WebSocketSessionManager webSocketSessionManager;
    private final SimpMessagingTemplate template;
    private final MessageAttachmentRepository messageAttachmentRepository;
    private final CloudPhotoHandlingService cloudPhotoHandlingService;

    public MessagePublisherService(
        ConversationUtilService conversationUtilService,
        WebSocketSessionManager webSocketSessionManager,
        SimpMessagingTemplate template,
        MessageAttachmentRepository messageAttachmentRepository,
        CloudPhotoHandlingService cloudPhotoHandlingService) {
        this.conversationUtilService = conversationUtilService;
        this.webSocketSessionManager = webSocketSessionManager;
        this.template = template;
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
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED, readOnly = true)
    public void invokeNewMessageToParticipants(Long conversationId, MessageViewDTO messageViewDTO, Long senderId, String workspaceId) {
        ConversationDTO conversationDTO = conversationUtilService.getConversationDTOOrThrow(senderId, conversationId);

        // when sending ws message, conversation name need to be named of the message sender for non group conversations
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
        messageViewDTO.setMessageAttachments(attachmentDTOs);

        conversationDTO.setMessages(List.of(messageViewDTO));

        conversationDTO.getParticipants().stream()
            .filter(p -> !p.getUser().getId().equals(senderId))
            .forEach(participant -> {
                String email = participant.getUser().getEmail();
                String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
                String sessionKey = "%s:%s".formatted(workspaceId, encodedEmail);

                ConversationDTO participantDTO = getConversationDTO(participant, conversationDTO);
                ConversationDTO participantDTOWithSignedImageUrl = conversationUtilService.addSignedImageUrlToConversationDTO(participantDTO, participantDTO.getImageIndexedName());

                webSocketSessionManager.getValidSession(sessionKey)
                    .ifPresent(session -> template.convertAndSend(
                        "%s/%s".formatted(MESSAGE_INVOKE_PATH, encodedEmail),
                        participantDTOWithSignedImageUrl
                    ));
            });
    }

    private static ConversationDTO getConversationDTO(ConversationParticipantViewDTO participant, ConversationDTO conversationDTO) {
        ConversationDTO participantDTO = new ConversationDTO(conversationDTO);

        participantDTO.setPinnedByLoggedInUser(participant.getIsPinnedByParticipant());
        participantDTO.setArchivedByLoggedInUser(participant.getIsArchivedByParticipant());
        participantDTO.setMutedByLoggedInUser(participant.getIsMutedByParticipant());
        participantDTO.setFavoriteByLoggedInUser(participant.getIsFavoriteByParticipant());

        // Remove participant details to minimize WebSocket payload size
        participantDTO.setParticipants(null);
        return participantDTO;
    }
}
