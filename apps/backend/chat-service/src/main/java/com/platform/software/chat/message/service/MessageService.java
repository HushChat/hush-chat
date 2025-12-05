package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.readstatus.entity.ConversationReadStatus;
import com.platform.software.chat.conversation.readstatus.repository.ConversationReadStatusRepository;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.chat.message.attachment.service.MessageAttachmentService;
import com.platform.software.chat.message.dto.*;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.entity.MessageHistory;
import com.platform.software.chat.message.repository.MessageHistoryRepository;
import com.platform.software.chat.message.repository.MessageRepository;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.aws.CloudPhotoHandlingService;
import com.platform.software.config.aws.SignedURLResponseDTO;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.controller.external.IdBasedPageRequest;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomResourceNotFoundException;
import com.platform.software.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MessageService {
    private final Logger logger = LoggerFactory.getLogger(MessageService.class);

    private final MessageRepository messageRepository;
    private final ConversationUtilService conversationUtilService;
    private final UserService userService;
    private final MessageAttachmentService messageAttachmentService;
    private final MessagePublisherService messagePublisherService;
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final MessageMentionService messageMentionService;
    private final ConversationReadStatusRepository conversationReadStatusRepository;
    private final MessageHistoryRepository messageHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final MessageUtilService messageUtilService;
    private final CloudPhotoHandlingService cloudPhotoHandlingService;

    public Page<Message> getRecentVisibleMessages(IdBasedPageRequest idBasedPageRequest, Long conversationId ,ConversationParticipant participant) {
        return messageRepository.findMessagesAndAttachments(conversationId, idBasedPageRequest, participant);
    }

    public Page<Message> getRecentVisibleMessages(Long messageId, Long conversationId ,ConversationParticipant participant) {
        return messageRepository.findMessagesAndAttachmentsByMessageId(conversationId, messageId, participant);
    }

    public static Message buildMessage(String messageText, Conversation conversation, ChatUser loggedInUser, MessageTypeEnum messageType) {
        Message newMessage = new Message();
        newMessage.setMessageText(messageText);
        newMessage.setConversation(conversation);
        newMessage.setSender(loggedInUser);
        newMessage.setMessageType(messageType);
        return newMessage;
    }

    private List<MessageAttachment> mapToNewAttachments(List<MessageAttachment> attachments, Message newMessage) {
        if (attachments == null) {
            return Collections.emptyList();
        }
        return attachments.stream()
                .map(a -> {
                    MessageAttachment copy = new MessageAttachment();
                    copy.setMessage(newMessage);
                    copy.setOriginalFileName(a.getOriginalFileName());
                    copy.setIndexedFileName(a.getIndexedFileName());
                    return copy;
                })
                .collect(Collectors.toList());
    }

    /**
     * Create message message view dto.
     *
     * @param messageDTO     the message dto
     * @param conversationId the conversation id
     * @param loggedInUserId the logged in user id
     * @return the message view dto
     */
    @Transactional
    public MessageViewDTO createMessage(
        MessageUpsertDTO messageDTO,
        Long conversationId,
        Long loggedInUserId
    ) {
        Message savedMessage = messageUtilService.createTextMessage(conversationId, loggedInUserId, messageDTO, MessageTypeEnum.TEXT);
        MessageViewDTO messageViewDTO = getMessageViewDTO(loggedInUserId, messageDTO.getParentMessageId(), savedMessage);

        messageMentionService.saveMessageMentions(savedMessage, messageViewDTO);

        conversationParticipantRepository.restoreParticipantsByConversationId(conversationId);

        setLastSeenMessageForMessageSentUser(savedMessage.getConversation(), savedMessage, savedMessage.getSender());

        eventPublisher.publishEvent(new MessageCreatedEvent(
                WorkspaceContext.getCurrentWorkspace(),
                conversationId,
                messageViewDTO,
                loggedInUserId,
                savedMessage
        ));

        return messageViewDTO;
    }

    /**
     * Edit message. only if a message sent by the logged-in user
     *
     * @param userId         the user id
     * @param conversationId the conversation id
     * @param messageId      the message id
     * @param messageDTO     the message dto
     */
    @Transactional
    public void editMessage(
        Long userId,
        Long conversationId,
        Long messageId,
        MessageUpsertDTO messageDTO
    ) {
        if (messageDTO.getMessageText() == null || messageDTO.getMessageText().isBlank()) {
            throw new CustomBadRequestException("Message text cannot be empty!");
        }

        Message message = getMessageBySender(userId, conversationId, messageId);

        if (message.getMessageText().equals(messageDTO.getMessageText())) {
            return;
        }

        message.setMessageText(messageDTO.getMessageText());
        MessageHistory newMessageHistory = getMessageHistoryEntity(messageDTO, message);

        try {
            messageRepository.save(message);
            messageHistoryRepository.save(newMessageHistory);
        } catch (Exception e) {
            logger.error("failed to save message edit history", e);
            throw new CustomBadRequestException("Failed to save message changes");
        }
    }

    private static MessageHistory getMessageHistoryEntity(MessageUpsertDTO messageDTO, Message message) {
        MessageHistory newMessageHistory = new MessageHistory();
        newMessageHistory.setMessageText(messageDTO.getMessageText());
        newMessageHistory.setMessage(message);
        return newMessageHistory;
    }

    private Message getMessageBySender(Long userId, Long conversationId, Long messageId) {
        Message message = messageRepository.findByConversation_IdAndIdAndSender_Id(conversationId, messageId, userId)
            .orElseThrow(() -> new CustomBadRequestException("Message does not exist or you don't have permission to edit this message"));
        return message;
    }

    public void setLastSeenMessageForMessageSentUser(Conversation conversation, Message savedMessage, ChatUser user) {
        ConversationReadStatus updatingStatus = conversationReadStatusRepository
            .findByConversationIdAndUserId(conversation.getId(), user.getId())
            .orElseGet(() -> {
                ConversationReadStatus newStatus = new ConversationReadStatus();
                newStatus.setUser(user);
                newStatus.setConversation(conversation);
                return newStatus;
            });

        updatingStatus.setMessage(savedMessage);

        try {
            conversationReadStatusRepository.save(updatingStatus);
        } catch (Exception exception) {
            logger.error("failed set message as read for latest sent: {}", savedMessage, exception);
        }
    }

    @Transactional
    public SignedURLResponseDTO getSignedURLResponseDTOAndCreateMessage(
        MessageUpsertDTO messageDTO,
        Long conversationId,
        Long loggedInUserId
    ) {
        Message savedMessage = messageUtilService.createTextMessage(conversationId, loggedInUserId, messageDTO, MessageTypeEnum.ATTACHMENT);
        SignedURLResponseDTO signedURLResponseDTO = messageAttachmentService.uploadFilesForMessage(messageDTO.getFiles(), savedMessage);

        MessageViewDTO messageViewDTO = getMessageViewDTO(loggedInUserId, messageDTO.getParentMessageId(), savedMessage);
        messagePublisherService.invokeNewMessageToParticipants(
                conversationId, messageViewDTO, loggedInUserId, WorkspaceContext.getCurrentWorkspace()
        );
        return signedURLResponseDTO;
    }

    /* * Creates a MessageViewDTO from the saved message and sets the sender ID and parent message ID.
     *
     * @param loggedInUserId the ID of the logged-in user
     * @param parentMessageId the ID of the parent message if this is a reply (optional)
     * @param savedMessage the saved Message entity
     * @return a MessageViewDTO containing the message details
     */
    private static MessageViewDTO getMessageViewDTO(Long loggedInUserId, Long parentMessageId, Message savedMessage) {
        MessageViewDTO messageViewDTO = new MessageViewDTO(savedMessage);
        return messageViewDTO;
    }

    /**
     * Forwards a message to multiple conversations.
     *
     * @param loggedInUserId the ID of the logged-in user
     * @param messageForwardRequestDTO the DTO containing forwarding details
     */
    @Transactional
    public void forwardMessages(Long loggedInUserId, MessageForwardRequestDTO messageForwardRequestDTO) {
        ValidationUtils.validate(messageForwardRequestDTO);

        // validating logged user has access to the forwarding message
        List<Message> messages = messageRepository.findByIdIn(messageForwardRequestDTO.getForwardedMessageIds());
        validateMessagesAndConversation(messages, messageForwardRequestDTO.getForwardedMessageIds());

        Conversation conversation = messages.stream().findFirst().get().getConversation();
        conversationUtilService.getConversationParticipantOrThrow(conversation.getId(), loggedInUserId);

        if(messageForwardRequestDTO.getUserIds() != null && !messageForwardRequestDTO.getUserIds().isEmpty()){
            // gathering conversation ids from user ids.
            Set<Long> conversationIdsByUserIds = conversationUtilService.getOrCreateConversationIds(
                    messageForwardRequestDTO.getUserIds(), loggedInUserId
            );

            messageForwardRequestDTO.addConversationIds(conversationIdsByUserIds);
        }

        // validating if the logged-in user is in every conversation involved in this forwarding
        List<ConversationDTO> joinedConversations = conversationUtilService.verifyLoggedInUserHasAccessToEveryConversation(
            loggedInUserId, messageForwardRequestDTO, conversation
        );

        // TODO: Exclude the source conversation from forwarding target conversations
        List<ConversationDTO> targetConversations = joinedConversations.stream()
                .filter(joinedConversation -> !joinedConversation.getId().equals(conversation.getId()))
                .toList();

        ChatUser loggedInUser = userService.getUserOrThrow(loggedInUserId);

        List<Message> forwardingMessages = new ArrayList<>();
        for (ConversationDTO targetConversation : targetConversations) {
            messages.forEach(message -> {
                Message newMessage = MessageService.buildMessage(message.getMessageText(), targetConversation.getModel(), loggedInUser, message.getMessageType());
                newMessage.setForwardedMessage(message);
                newMessage.setAttachments(mapToNewAttachments(message.getAttachments(), newMessage));
                forwardingMessages.add(newMessage);
            });

            // Send custom text once per conversation
            if (StringUtils.hasText(messageForwardRequestDTO.getCustomText())) {
                Message customMessage = MessageService.buildMessage(
                        messageForwardRequestDTO.getCustomText(),
                        targetConversation.getModel(),
                        loggedInUser,
                        MessageTypeEnum.TEXT
                );
                forwardingMessages.add(customMessage);
            }

            try {
                for(Message message: forwardingMessages){
                    messageRepository.saveMessageWthSearchVector(message);

                    MessageViewDTO messageViewDTO = new MessageViewDTO(message);

                    eventPublisher.publishEvent(new MessageCreatedEvent(
                            WorkspaceContext.getCurrentWorkspace(),
                            message.getConversation().getId(),
                            messageViewDTO,
                            loggedInUserId,
                            message
                    ));
                }

            } catch (Exception exception) {
                logger.error("failed forward messages {}", messageForwardRequestDTO, exception);
                throw new CustomBadRequestException("Failed to forward message");
            }
        }
    }

    /**
     * validate messages and their conversation - must be from same conversation
     *
     * @param messages - requested messages entity
     * @param forwardedMessageIds - requested message ids
     */
    private static void validateMessagesAndConversation(List<Message> messages, Set<Long> forwardedMessageIds) {
        Set<Long> messageIds = messages.stream()
                .filter(message -> !message.getIsUnsend())
                .map(Message::getId)
                .collect(Collectors.toSet());

        if (messageIds.size() != forwardedMessageIds.size()) {
            Set<Long> mismatchedMessageIds = new HashSet<>(forwardedMessageIds);
            mismatchedMessageIds.removeAll(messageIds);
            throw new CustomBadRequestException("cannot identify messages with ids: %s !".formatted(mismatchedMessageIds));
        }

        Set<Long> conversationIds = messages.stream().map(m -> m.getConversation().getId()).collect(Collectors.toSet());
        if (conversationIds.size() > 1) {
            throw new CustomBadRequestException("Cannot forward messages from multiple conversations!");
        }
    }

    /**
     * Retrieves a message if the user is a participant in the conversation.
     *
     * @param userId the ID of the user
     * @param messageId the ID of the message
     * @return the Message entity if the user is a participant
     */
    public Message getMessageIfUserParticipant(Long userId, Long messageId) {
        Message message = getMessageOrThrow(messageId);

        Long conversationId = message.getConversation().getId();
        boolean isParticipant = conversationParticipantRepository
            .existsByConversationIdAndUserId(conversationId, userId);

        if (!isParticipant) {
            logger.warn("user {} attempted to view message {} but is not a participant in conversation {}",
                userId, messageId, conversationId);
            throw new CustomBadRequestException("User is not a participant of this conversation.");
        }
        return message;
    }

    /** Retrieves a message by its ID.
     *
     * @param messageId the ID of the message
     * @return the Message entity
     */
    public Message getMessageOrThrow(Long messageId) {
        return messageRepository.findById(messageId)
            .orElseThrow(() -> {
                logger.error("message with id {} not found when creating favorite message", messageId);
                return new CustomResourceNotFoundException("Message not found!");
            });
    }

    /**
     * Retrieves all messages in a thread for a given message ID.
     *
     * @param messageId the ID of any message within the thread
     * @return a flat list of MessageViewDTO objects representing all messages in the thread,
     *         ordered by creation time, with parent message references preserved
     * @throws CustomResourceNotFoundException if no messages are found for the given message ID
     */
    public List<MessageViewDTO> getMessageThread(Long messageId) {
        List<Message> messages = messageRepository.getFullMessageThread(messageId);

        if (messages.isEmpty()) {
            logger.error("Thread fetch failed: No message found for messageId={}", messageId);
            throw new CustomResourceNotFoundException("No messages found for thread!");
        }

        return messages.stream()
                .map(message -> {
                    MessageViewDTO messageDTO = new MessageViewDTO(message, true);

                    if (message.getSender() != null &&
                            message.getSender().getImageIndexedName() != null) {
                        String signedUrl = cloudPhotoHandlingService
                                .getPhotoViewSignedURL(message.getSender().getImageIndexedName());
                        messageDTO.setSenderSignedImageUrl(signedUrl);
                    }

                    return messageDTO;
                })
                .collect(Collectors.toList());
    }

    /**
     * Search messages from conversation list.
     *
     * @param conversationId          the conversation id
     * @param loggedInUserId          the logged in user id
     * @param messageSearchRequestDTO the message search request dto
     * @return the list
     */
    public List<MessageViewDTO> searchMessagesFromConversation(Long conversationId, Long loggedInUserId, MessageSearchRequestDTO messageSearchRequestDTO) {
        ConversationParticipant participant = conversationUtilService.getConversationParticipantOrThrow(conversationId, loggedInUserId);
        Date deletedAt = Optional.ofNullable(participant.getLastDeletedTime())
                .map(zdt -> Date.from(zdt.toInstant()))
                .orElse(new Date(0));

        return messageRepository.findBySearchTermAndConversationNative(messageSearchRequestDTO.getSearchKeyword(), conversationId, deletedAt)
            .stream().map(MessageViewDTO::new).toList();
    }

    /**
     * unsend messages from conversation list.
     *
     * @param loggedInUserId the logged in user id
     * @param messageId the message id to unsend
     */
    @Transactional
    public void unsendMessage(Long loggedInUserId, Long messageId) {
        Message message = messageRepository.findDeletableMessage(messageId, loggedInUserId)
                .orElseThrow(() -> new CustomBadRequestException(
                        "Message not found, not owned by you, or you don’t have permission to delete it"
                ));

        if (message.getCreatedAt().before(Date.from(Instant.now().minus(24, ChronoUnit.HOURS)))) {
            throw new CustomBadRequestException("You can only delete a message within 24 hours of sending it");
        }

        message.setIsUnsend(true);
        messageRepository.save(message);
    }
}