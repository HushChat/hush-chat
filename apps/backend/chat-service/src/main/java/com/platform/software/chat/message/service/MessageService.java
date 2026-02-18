package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.readstatus.dto.ConversationReadInfo;
import com.platform.software.chat.conversation.readstatus.entity.ConversationReadStatus;
import com.platform.software.chat.conversation.readstatus.repository.ConversationReadStatusRepository;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.chat.message.attachment.service.MessageAttachmentService;
import com.platform.software.chat.message.dto.*;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.entity.MessageHistory;
import com.platform.software.chat.message.entity.MessageMention;
import com.platform.software.chat.message.repository.MessageHistoryRepository;
import com.platform.software.chat.message.repository.MessageMentionRepository;
import com.platform.software.chat.message.repository.MessageRepository;
import com.platform.software.chat.message.repository.MessageRepository.MessageThreadProjection;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.common.model.MediaPathEnum;
import com.platform.software.common.model.MediaSizeEnum;
import com.platform.software.config.aws.SignedURLResponseDTO;
import com.platform.software.config.security.model.UserDetails;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.controller.external.IdBasedPageRequest;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomResourceNotFoundException;
import com.platform.software.utils.CommonUtils;
import com.platform.software.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
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
    private final MessageMentionRepository messageMentionRepository;

    public Page<Message> getRecentVisibleMessages(IdBasedPageRequest idBasedPageRequest, Long conversationId ,ConversationParticipant participant, Long requesterId) {
        return messageRepository.findMessagesAndAttachments(conversationId, idBasedPageRequest, participant, requesterId);
    }

    public MessageWindowPage<Message> getRecentVisibleMessages(Long messageId, Long conversationId ,ConversationParticipant participant) {
        return messageRepository.findMessagesAndAttachmentsByMessageId(conversationId, messageId, participant);
    }

    public static Message buildMessage(String messageText, Conversation conversation, ChatUser loggedInUser, MessageTypeEnum messageType, Boolean isMarkdownEnabled) {
        Message newMessage = new Message();
        newMessage.setMessageText(messageText);
        newMessage.setConversation(conversation);
        newMessage.setSender(loggedInUser);
        newMessage.setMessageType(messageType);
        newMessage.setIsMarkdownEnabled(isMarkdownEnabled);
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
                    copy.setType(a.getType());
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

        if (messageViewDTO.getParentMessage() != null && messageViewDTO.getParentMessage().getHasAttachment()) {
            MessageAttachmentDTO attachmentDTO = messageViewDTO.getParentMessage().getMessageAttachments().getFirst();
            List<MessageAttachmentDTO> enrichedMessageAttachmentDTOts = messageUtilService.enrichParentMessageAttachmentsWithSignedUrl(List.of(attachmentDTO));
            messageViewDTO.getParentMessage().setMessageAttachments(enrichedMessageAttachmentDTOts);
        }

        conversationParticipantRepository.restoreParticipantsByConversationId(conversationId);

        setLastSeenMessageForMessageSentUser(savedMessage.getConversation(), savedMessage, savedMessage.getSender());

        eventPublisher.publishEvent(new MessageCreatedEvent(
                WorkspaceContext.getCurrentWorkspace(),
                conversationId,
                messageViewDTO,
                loggedInUserId,
                savedMessage,
                MessageTypeEnum.TEXT
        ));

        return messageViewDTO;
    }

    /**
     * Create bot message view dto.
     *
     * @param messageDTO     the message dto
     * @param conversationId the conversation id
     * @param loggedInUserId the logged-in user id
     * @return the message view dto
     */
    @Transactional
    public MessageViewDTO createBotMessage(
            MessageUpsertDTO messageDTO,
            Long conversationId,
            Long loggedInUserId
    ) {
        Message savedMessage = messageUtilService.createBotMessage(conversationId, loggedInUserId, messageDTO, MessageTypeEnum.TEXT);
        MessageViewDTO messageViewDTO = getMessageViewDTO(loggedInUserId, messageDTO.getParentMessageId(), savedMessage);

        messageMentionService.saveMessageMentions(savedMessage, messageViewDTO);

        conversationParticipantRepository.restoreParticipantsByConversationId(conversationId);

        eventPublisher.publishEvent(new MessageCreatedEvent(
                WorkspaceContext.getCurrentWorkspace(),
                conversationId,
                messageViewDTO,
                loggedInUserId,
                savedMessage,
                MessageTypeEnum.BOT_MESSAGE
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
     * @return the updated message view dto
     */
    @Transactional
    public MessageViewDTO editMessage(
        Long userId,
        Long conversationId,
        Long messageId,
        MessageUpsertDTO messageDTO
    ) {
        if (messageDTO.getMessageText() == null || messageDTO.getMessageText().isBlank()) {
            throw new CustomBadRequestException("Message text cannot be empty!");
        }

        Message message = getMessageBySender(userId, conversationId, messageId);
        Conversation conversation = message.getConversation();

        if (message.getForwardedMessage() != null) {
            throw new CustomBadRequestException("Cannot edit a forwarded message!");
        }

        if (message.getMessageText().equals(messageDTO.getMessageText()) && message.getIsMarkdownEnabled().equals(messageDTO.getIsMarkdownEnabled())) {
            return new MessageViewDTO(message);
        }

        messageUtilService.checkInteractionRestrictionBetweenOneToOneConversation(conversation);

        MessageHistory newMessageHistory = getMessageHistoryEntity(message);
        message.setMessageText(messageDTO.getMessageText());
        message.setIsEdited(true);
        message.setIsMarkdownEnabled(messageDTO.getIsMarkdownEnabled());

        try {
            Message updatedMessage = messageRepository.saveMessageWthSearchVector(message);
            messageHistoryRepository.save(newMessageHistory);

            MessageViewDTO messageViewDTO = new MessageViewDTO(updatedMessage);

            eventPublisher.publishEvent(new MessageUpdatedEvent(
                    WorkspaceContext.getCurrentWorkspace(),
                    conversationId,
                    messageViewDTO,
                    messageViewDTO.getSenderId()));

            return messageViewDTO;
        } catch (Exception e) {
            logger.error("failed to save message edit history", e);
            throw new CustomBadRequestException("Failed to save message changes");
        }
    }

    private static MessageHistory getMessageHistoryEntity(Message message) {
        MessageHistory newMessageHistory = new MessageHistory();
        newMessageHistory.setMessageText(message.getMessageText());
        newMessageHistory.setMessage(message);
        return newMessageHistory;
    }

    public Message getMessageBySender(Long userId, Long conversationId, Long messageId) {
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
                conversationId, messageViewDTO, loggedInUserId, WorkspaceContext.getCurrentWorkspace(), MessageTypeEnum.ATTACHMENT
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
            Message savedMessage = messageUtilService.createTextMessage(
                conversationId, loggedInUserId, 
                messageDTO.getMessageUpsertDTO(), 
                MessageTypeEnum.ATTACHMENT
            );
            
            MessageViewDTO messageViewDTO = getMessageViewDTO(
                loggedInUserId, 
                messageDTO.getParentMessageId(), 
                savedMessage
            );

            messageMentionService.saveMessageMentions(savedMessage, messageViewDTO);
            
            if (messageDTO.isGifAttachment()) {
                MessageAttachment messageAttachment = messageAttachmentService.createGifAttachment(messageDTO.getGifUrl(), savedMessage);
                messageViewDTO.setMessageAttachments(List.of(new MessageAttachmentDTO(messageAttachment)));
                
                setLastSeenMessageForMessageSentUser(savedMessage.getConversation(), savedMessage, savedMessage.getSender());
                
                eventPublisher.publishEvent(new MessageCreatedEvent(
                    WorkspaceContext.getCurrentWorkspace(),
                    conversationId,
                    messageViewDTO,
                    loggedInUserId,
                    savedMessage,
                    MessageTypeEnum.ATTACHMENT
                ));
            } else {
                SignedURLResponseDTO signedURLResponseDTO = messageAttachmentService.uploadFilesForMessage(
                    messageDTO.getFileName(), 
                    savedMessage
                );
                messageViewDTO.setSignedUrl(signedURLResponseDTO.getSignedURLs().getFirst());
            }
            
            createdMessages.add(messageViewDTO);
        }
        
        return createdMessages;
    }

    /**
     * Publishes message events for the specified message IDs after attachment uploads are completed.
     * This method filters messages to ensure they belong to the authenticated user and conversation,
     * updates the last seen message for the sender, and publishes MessageCreatedEvent for each valid message.
     *
     * @param messageIds the list of message IDs to publish events for
     * @param conversationId the ID of the conversation
     * @param loggedInUserId the ID of the logged-in user
     */
    @Transactional
    public void publishMessageEvents(List<Long> messageIds, Long conversationId, Long loggedInUserId) {
        String currentWorkspace = WorkspaceContext.getCurrentWorkspace();
        
        List<Message> messages = messageRepository.findAllById(messageIds);
        
        for (Message message : messages) {
            if (!message.getSender().getId().equals(loggedInUserId) || 
                !message.getConversation().getId().equals(conversationId)) {
                continue;
            }

            // attachments considered as successfully sent after acknowledging its being uploaded s3 bucket correctly.
            message.setIsStored(true);
            
            MessageViewDTO messageViewDTO = new MessageViewDTO(message);
            
            eventPublisher.publishEvent(new MessageCreatedEvent(
                currentWorkspace,
                conversationId,
                messageViewDTO,
                loggedInUserId,
                message,
                MessageTypeEnum.TEXT
            ));
        }
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

        String extractedUrl = CommonUtils.extractUrl(messageViewDTO.getMessageText());
        if (extractedUrl != null) {
            messageViewDTO.setIsIncludeUrlMetadata(true);
        }

        return messageViewDTO;
    }

    /**
     * Forwards a message to multiple conversations.
     *
     * @param loggedInUserId the ID of the logged-in user
     * @param messageForwardRequestDTO the DTO containing forwarding details
     */
    @Transactional
    public MessageForwardResponseDTO forwardMessages(Long loggedInUserId, MessageForwardRequestDTO messageForwardRequestDTO) {
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
        
        List<Long> forwardedConversations = new ArrayList<>(List.of());

        List<Message> forwardingMessages = new ArrayList<>();
        for (ConversationDTO targetConversation : targetConversations) {
            messages.forEach(message -> {
                Message newMessage = MessageService.buildMessage(message.getMessageText(), targetConversation.getModel(), loggedInUser, message.getMessageType(), message.getIsMarkdownEnabled());
                newMessage.setForwardedMessage(message);
                newMessage.setAttachments(mapToNewAttachments(message.getAttachments(), newMessage));
                newMessage.setIsStored(true);
                forwardingMessages.add(newMessage);
            });

            // Send custom text once per conversation
            if (StringUtils.hasText(messageForwardRequestDTO.getCustomText())) {
                Message customMessage = MessageService.buildMessage(
                        messageForwardRequestDTO.getCustomText(),
                        targetConversation.getModel(),
                        loggedInUser,
                        MessageTypeEnum.TEXT,
                        messageForwardRequestDTO.getIsMarkdownEnabled()
                );
                customMessage.setIsStored(true);
                forwardingMessages.add(customMessage);
            }

            try {
                for(Message message: forwardingMessages){
                    Message savedMessage = messageRepository.saveMessageWthSearchVector(message);

                    setLastSeenMessageForMessageSentUser(targetConversation.getModel(), savedMessage, loggedInUser);

                    MessageViewDTO messageViewDTO = new MessageViewDTO(message);

                    eventPublisher.publishEvent(new MessageCreatedEvent(
                            WorkspaceContext.getCurrentWorkspace(),
                            message.getConversation().getId(),
                            messageViewDTO,
                            loggedInUserId,
                            message,
                            MessageTypeEnum.TEXT
                    ));
                }

            } catch (Exception exception) {
                logger.error("failed forward messages {}", messageForwardRequestDTO, exception);
                throw new CustomBadRequestException("Failed to forward message");
            }
            forwardedConversations.add(targetConversation.getId());
        }

        return new MessageForwardResponseDTO(forwardedConversations);
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
            throw new CustomBadRequestException("Messages not found!");
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
        return messageRepository.findByIdWithSenderAndConversation(messageId)
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
                        "Message not found, not owned by you, or you don’t have permission to delete it"));

        Conversation conversation = message.getConversation();
        messageUtilService.checkInteractionRestrictionBetweenOneToOneConversation(conversation);

        if (message.getCreatedAt().before(Date.from(Instant.now().minus(5, ChronoUnit.MINUTES)))) {
            throw new CustomBadRequestException("You can only unsend a message within 5 minutes of sending it");
        }

        message.setIsUnsend(true);
        messageRepository.save(message);

        eventPublisher.publishEvent(new MessageUnsentEvent(
                WorkspaceContext.getCurrentWorkspace(),
                message.getConversation().getId(),
                message.getId(),
                loggedInUserId));
    }

    /**
     * Marks a message as unread by setting the user's last seen message to the previous message.
     * If the target message is the first message in the conversation, sets last seen to null.
     *
     * @param conversationId The conversation ID
     * @param loggedInUserId The logged-in user ID
     * @param messageId The message ID to mark as unread
     * @return ConversationReadInfo with updated read status
     */
    @Transactional
    public ConversationReadInfo markMessageAsUnread(Long conversationId, Long loggedInUserId, Long messageId) {
        ConversationParticipant participant = conversationUtilService
            .getConversationParticipantOrThrow(conversationId, loggedInUserId);
        
        Message targetMessage = messageRepository
            .findByConversation_IdAndId(conversationId, messageId)
            .orElseThrow(() -> new CustomBadRequestException("Message not found in this conversation"));

        if (targetMessage.getSender().getId().equals(loggedInUserId)) {
            throw new CustomBadRequestException("Cannot mark your own messages as unread");
        }
        
        Optional<Message> previousMessage = messageRepository
            .findPreviousMessage(conversationId, messageId, participant);
        
        ConversationReadStatus updatingStatus = conversationReadStatusRepository
            .findByConversationIdAndUserId(conversationId, loggedInUserId)
            .orElseGet(() -> {
                ConversationReadStatus newStatus = new ConversationReadStatus();
                newStatus.setUser(participant.getUser());
                newStatus.setConversation(participant.getConversation());
                return newStatus;
            });
        
        updatingStatus.setMessage(previousMessage.orElse(null));
        
        try {
            conversationReadStatusRepository.save(updatingStatus);
        } catch (Exception exception) {
            logger.error("failed to mark message {} as unread for user {}", messageId, loggedInUserId, exception);
            throw new CustomBadRequestException("Failed to mark message as unread");
        }
        
        return conversationReadStatusRepository.findConversationReadInfoByConversationIdAndUserId(
            conversationId,
            loggedInUserId
        );
    }

    /**
     * Retrieves all message mentions by others for a specific user with pagination support.
     * <p>
     * This method queries the database for all messages where the specified user has been mentioned,
     * converts the entities to DTOs, and returns them in a paginated format.
     * </p>
     *
     * @param userDetails the user whose message mentions are being retrieved
     * @param pageable pagination and sorting information (page number, size, sort order)
     * @return a {@link Page} of {@link MessageMentionDTO} objects representing the user's mentions
     */
    public Page<MessageMentionDTO> getAllUserMessageMentions(UserDetails userDetails, Pageable pageable) {
        Page<MessageMention> messageMentionPage = messageMentionRepository.findAllUserMentionsByOthers(userDetails.getId(), pageable);

        Page<MessageMentionDTO> messageMentionDTOPages = messageMentionPage.map(messageMention -> {
            MessageMentionDTO dto = new MessageMentionDTO(messageMention);

            String imageIndexedName = messageMention.getMessage().getSender().getImageIndexedName();
            if (imageIndexedName != null) {
                String signedImageUrl = conversationUtilService.getImageViewSignedUrl( MediaPathEnum.RESIZED_PROFILE_PICTURE, MediaSizeEnum.MEDIUM , imageIndexedName);
                dto.getMessage().setSenderSignedImageUrl(signedImageUrl);
            }

            return dto;
        });

        return messageMentionDTOPages;
    }

    /**
     * Scrapes and extracts metadata from the first URL found within a specific message's text.
     *
     * @param messageId the ID of the message to process
     * @return a {@link MessageUrlMetadataDTO} containing the scraped preview data,
     * or {@code null} if the message contains no valid URL
     * @throws CustomBadRequestException if the message does not exist or if an error
     * occurs while connecting to and parsing the external URL
     */
    public MessageUrlMetadataDTO getMessageUrlMetadata(Long messageId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new CustomBadRequestException("Message not found"));

        String extractedUrl = null;

        MessageUrlMetadataDTO dto = new MessageUrlMetadataDTO();
        try {
            // We pretend to be whatsApp to get modified meta tags if pages have dynamic rendering depend on user agent
            // eg :- If you use a standard browser User-Agent, you might get the standard GitHub logo, title, description etc.
            String userAgent = "FacebookExternalHit/1.1";

            extractedUrl = CommonUtils.extractUrl(message.getMessageText());
            if (extractedUrl == null) {
                return null;
            }

            dto.setSiteUrl(extractedUrl);

            Document document = Jsoup.connect(extractedUrl)
                    .userAgent(userAgent)
                    .timeout(10000)
                    .get();

            dto.setTitle(getMetaTagContent(document, "og:title"));
            if (dto.getTitle() == null) {
                dto.setTitle(document.title());
            }

            dto.setDescription(getMetaTagContent(document, "og:description"));
            if (dto.getDescription() == null) {
                dto.setDescription(getMetaTagContent(document, "description"));
            }

            dto.setImageUrl(getMetaTagContent(document, "og:image"));
            if (dto.getImageUrl() == null) {
                dto.setImageUrl(getMetaTagContent(document, "twitter:image"));
            }

            try {
                String fullUrl = document.location();
                URI uri = new URI(fullUrl);
                String domain = uri.getHost();
                if (domain != null && domain.startsWith("www.")) {
                    domain = domain.substring(4);
                }

                dto.setDomain(domain);

            } catch (URISyntaxException e) {
                dto.setDomain(extractedUrl);
            }

        } catch (IOException exception) {
            logger.error("failed to extract domain for url: {}", extractedUrl, exception);
            return null;
        }

        return dto;
    }

    /**
     * Extracts the content attribute of a meta tag from the provided HTML document.
     *
     * @param doc      the Jsoup {@link Document} representing the parsed HTML page
     * @param property the name or property attribute value to search for (e.g., "og:title", "description")
     * @return the string value of the {@code content} attribute if found; {@code null} otherwise
     */
    private String getMetaTagContent(Document doc, String property) {
        Element element = doc.select("meta[property=" + property + "]").first();
        if (element == null) {
            element = doc.select("meta[name=" + property + "]").first();
        }
        return (element != null) ? element.attr("content") : null;
    }
}