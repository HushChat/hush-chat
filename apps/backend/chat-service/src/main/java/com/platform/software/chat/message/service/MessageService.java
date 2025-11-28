package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.readstatus.entity.ConversationReadStatus;
import com.platform.software.chat.conversation.readstatus.repository.ConversationReadStatusRepository;
import com.platform.software.chat.conversation.repository.ConversationRepository;
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
import com.platform.software.chat.message.repository.MessageRepository.MessageThreadProjection;
import com.platform.software.chat.notification.service.ChatNotificationService;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.config.aws.SignedURLResponseDTO;
import com.platform.software.controller.external.IdBasedPageRequest;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomForbiddenException;
import com.platform.software.exception.CustomInternalServerErrorException;
import com.platform.software.exception.CustomResourceNotFoundException;
import com.platform.software.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationAdapter;
import org.springframework.transaction.support.TransactionSynchronizationManager;
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
    private final ConversationRepository conversationRepository;
    private final ChatNotificationService chatNotificationService;
    private final ConversationReadStatusRepository conversationReadStatusRepository;
    private final MessageHistoryRepository messageHistoryRepository;

    public Message getMessageOrThrow(Long conversationId, Long messageId) {
        Message message = messageRepository
            .findByConversation_IdAndId(conversationId, messageId)
            .orElseThrow(() -> new CustomBadRequestException("Message does not exist or you don't have permission to this message!"));
        return message;
    }

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
        Message savedMessage = createTextMessage(conversationId, loggedInUserId, messageDTO, MessageTypeEnum.TEXT);
        MessageViewDTO messageViewDTO = getMessageViewDTO(loggedInUserId, messageDTO.getParentMessageId(), savedMessage);

        messageMentionService.saveMessageMentions(savedMessage, messageViewDTO);

        conversationParticipantRepository.restoreParticipantsByConversationId(conversationId);

        setLastSeenMessageForMessageSentUser(savedMessage.getConversation(), savedMessage, savedMessage.getSender());

        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronizationAdapter() {
            @Override
            public void afterCommit() {
                messagePublisherService.invokeNewMessageToParticipants(
                    conversationId, messageViewDTO, loggedInUserId, WorkspaceContext.getCurrentWorkspace()
                );

                chatNotificationService.sendMessageNotificationsToParticipants(conversationId, loggedInUserId, savedMessage);
            }
        });

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

    private void setLastSeenMessageForMessageSentUser(Conversation conversation, Message savedMessage, ChatUser user) {
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
        Message savedMessage = createTextMessage(conversationId, loggedInUserId, messageDTO, MessageTypeEnum.ATTACHMENT);
        SignedURLResponseDTO signedURLResponseDTO = messageAttachmentService.uploadFilesForMessage(messageDTO.getFiles(), savedMessage);

        MessageViewDTO messageViewDTO = getMessageViewDTO(loggedInUserId, messageDTO.getParentMessageId(), savedMessage);
        messagePublisherService.invokeNewMessageToParticipants(
                conversationId, messageViewDTO, loggedInUserId, WorkspaceContext.getCurrentWorkspace()
        );
        return signedURLResponseDTO;
    }

    /**
     * Create messages with attachments list.
     *
     * @param messageDTOs    the message dt os
     * @param conversationId the conversation id
     * @param loggedInUserId the logged in user id
     * @return the list
     */
    @Transactional
    public List<MessageViewDTO> createMessagesWithAttachments(
        List<MessageWithAttachmentUpsertDTO> messageDTOs,
        Long conversationId,
        Long loggedInUserId
    ) {
        List<MessageViewDTO> createdMessages = new ArrayList<>();
        for (MessageWithAttachmentUpsertDTO messageDTO : messageDTOs) {
            Message savedMessage = createTextMessage(conversationId, loggedInUserId, messageDTO.getMessageUpsertDTO(), MessageTypeEnum.ATTACHMENT);
            SignedURLResponseDTO signedURLResponseDTO = messageAttachmentService.uploadFilesForMessage(messageDTO.getFileName(), savedMessage);

            MessageViewDTO messageViewDTO = getMessageViewDTO(loggedInUserId, messageDTO.getParentMessageId(), savedMessage);
            messageViewDTO.setSignedUrl(signedURLResponseDTO.getSignedURLs().getFirst());
            createdMessages.add(messageViewDTO);

            messagePublisherService.invokeNewMessageToParticipants(
                conversationId, messageViewDTO, loggedInUserId, WorkspaceContext.getCurrentWorkspace()
            );
        }

        return createdMessages;
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

    public void validateInteractionAllowed(Conversation conversation, Long senderUserId) {
        if (!conversation.getIsGroup()) {
            Long recipientId = getRecipientIdForOneToOne(senderUserId, conversation);
            if (userService.isInteractionBlockedBetween(senderUserId, recipientId)) {
                logger.warn("User {} attempted to interact with blocked user {} in conversation {}",
                        senderUserId, recipientId, conversation.getId());

                // TODO: Replace with CustomBusinessRuleException once we standardize business rule violations
                throw new CustomBadRequestException("Cannot interact with blocked conversations");
            }
        } else {
            boolean isActive = conversationRepository.getIsActiveByConversationIdAndUserId(conversation.getId(), senderUserId);
            if (!isActive) {
                logger.warn("User {} attempted to interact in inactive group conversation {}",
                        senderUserId, conversation.getId());
                throw new CustomForbiddenException("Cannot interact in inactive group conversation");
            }
        }
    }

    /**
     * Creates a new text message in the specified conversation.
     *
     * @param conversationId the ID of the conversation
     * @param senderUserId the ID of the user sending the message
     * @param message the message details
     * @return the saved Message entity
     */
    public Message createTextMessage(Long conversationId, Long senderUserId, MessageUpsertDTO message, MessageTypeEnum messageType) {
        ConversationParticipant participant = conversationUtilService.getConversationParticipantOrThrow(conversationId, senderUserId);
        ChatUser loggedInUser = userService.getUserOrThrow(senderUserId);
        Conversation conversation = participant.getConversation();

        validateInteractionAllowed(conversation, senderUserId);

        Message newMessage = MessageService.buildMessage(message.getMessageText(), conversation, loggedInUser, messageType);
        addParentMessageIfReply(conversationId, message.getParentMessageId(), newMessage);

        try {
            return messageRepository.saveMessageWthSearchVector(newMessage);
        } catch (Exception e) {
            logger.error("conversation message save failed.", e);
            throw new CustomInternalServerErrorException("Failed to send message");
        }
    }

    /** Adds a parent message to the new message if it is a reply.
     *
     * @param conversationId the ID of the conversation
     * @param parentMessageId the ID of the parent message if this is a reply (optional)
     * @param newMessage the new message to which the parent message will be added
     */
    private void addParentMessageIfReply(Long conversationId, Long parentMessageId, Message newMessage) {
        if (parentMessageId != null) {
            Message parentMessage = this.getMessageOrThrow(conversationId, parentMessageId);
            newMessage.setParentMessage(parentMessage);
        }
    }

    /**
     * Retrieves the recipient ID for a one-to-one conversation.
     *
     * @param senderId the ID of the sender
     * @param conversation the conversation object
     * @return the ID of the recipient
     */
    public Long getRecipientIdForOneToOne(Long senderId, Conversation conversation) {
        List<ConversationParticipant> participants = conversation.getConversationParticipants();
        if (participants.size() != 2) {
            logger.error("conversation {} has {} participants, expected 2",
                    conversation.getId(), participants.size());
            throw new CustomBadRequestException("Invalid conversation!");
        }
        return participants.stream()
                .map(ConversationParticipant::getUser)
                .map(ChatUser::getId)
                .filter(id -> !id.equals(senderId))
                .findFirst()
                .orElseThrow(() -> new CustomBadRequestException("Recipient not found!"));
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

                    TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                        @Override
                        public void afterCommit() {
                            messagePublisherService.invokeNewMessageToParticipants(
                                    message.getConversation().getId(), messageViewDTO, loggedInUserId, WorkspaceContext.getCurrentWorkspace()
                            );

                            chatNotificationService.sendMessageNotificationsToParticipants(message.getConversation().getId(), loggedInUserId, message);
                        }
                    });
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
    private Message getMessageOrThrow(Long messageId) {
        return messageRepository.findById(messageId)
            .orElseThrow(() -> {
                logger.error("message with id {} not found when creating favorite message", messageId);
                return new CustomResourceNotFoundException("Message not found!");
            });
    }

    /**
     * Retrieves a message thread for a specific message.
     *
     * @param userId             the ID of the user
     * @param messageId          the ID of the message
     * @param includeParentChain whether to include the parent message chain
     * @return the MessageThreadResponseDTO containing the message thread
     */
    public MessageThreadResponseDTO getMessageThread(
            Long userId,
            Long messageId,
            boolean includeParentChain) {
        Message targetMessage = getMessageIfUserParticipant(userId, messageId);

        if (includeParentChain) {
            return getMessageThreadWithFullParentChain(messageId);
        }

        return getMessageThreadWithImmediateParent(targetMessage);
    }

    /**
     * Retrieves a message thread with the full parent chain.
     *
     * @param messageId the ID of the message
     * @return the MessageThreadResponseDTO containing the message and full parent
     *         chain
     */
    private MessageThreadResponseDTO getMessageThreadWithFullParentChain(Long messageId) {
        List<MessageThreadProjection> chainResults = messageRepository.getMessageWithParentChain(messageId);

        if (chainResults.isEmpty()) {
            throw new CustomBadRequestException("Message not found");
        }

        MessageThreadProjection targetProjection = chainResults.get(0);
        MessageViewDTO targetMessageDto = convertProjectionToMessageViewDTO(targetProjection);

        List<MessageViewDTO> parentChain = chainResults.stream()
                .skip(1)
                .map(this::convertProjectionToMessageViewDTO)
                .collect(Collectors.toList());

        return new MessageThreadResponseDTO(targetMessageDto, parentChain);
    }

    /**
     * Retrieves a message thread with only the immediate parent.
     *
     * @param targetMessage the target message
     * @return the MessageThreadResponseDTO containing the message and immediate
     *         parent only
     */
    private MessageThreadResponseDTO getMessageThreadWithImmediateParent(Message targetMessage) {
        MessageViewDTO targetMessageDto = new MessageViewDTO(targetMessage);

        List<MessageViewDTO> parentChain = null;
        if (targetMessage.getParentMessage() != null) {
            parentChain = new ArrayList<>();
            parentChain.add(new MessageViewDTO(targetMessage.getParentMessage()));
        }

        return new MessageThreadResponseDTO(targetMessageDto, parentChain);
    }

    private MessageViewDTO convertProjectionToMessageViewDTO(MessageThreadProjection projection) {
        MessageViewDTO messageViewDTO = new MessageViewDTO();
        messageViewDTO.setId(projection.getId());
        messageViewDTO.setMessageText(projection.getMessageText());
        messageViewDTO.setCreatedAt(projection.getCreatedAt());
        messageViewDTO.setSenderId(projection.getSenderId());
        messageViewDTO.setSenderFirstName(projection.getSenderFirstName());
        messageViewDTO.setSenderLastName(projection.getSenderLastName());

        return messageViewDTO;
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
        conversationUtilService.getConversationParticipantOrThrow(conversationId, loggedInUserId);

        return messageRepository.findBySearchTermAndConversationNative(messageSearchRequestDTO.getSearchKeyword(), conversationId)
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