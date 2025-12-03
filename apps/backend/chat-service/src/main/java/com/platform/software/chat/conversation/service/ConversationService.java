package com.platform.software.chat.conversation.service;


import com.platform.software.chat.conversation.dto.*;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.entity.ConversationEvent;
import com.platform.software.chat.conversation.entity.ConversationReport;
import com.platform.software.chat.conversation.entity.ConversationReportReasonEnum;
import com.platform.software.chat.conversation.readstatus.dto.ConversationReadInfo;
import com.platform.software.chat.conversation.readstatus.repository.ConversationReadStatusRepository;
import com.platform.software.chat.conversation.readstatus.service.ConversationReadStatusService;
import com.platform.software.chat.conversation.repository.ConversationEventRepository;
import com.platform.software.chat.conversation.repository.ConversationReportRepository;
import com.platform.software.chat.conversation.repository.ConversationRepository;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantFilterCriteriaDTO;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.chat.conversationparticipant.dto.JoinParticipantRequestDTO;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantCommandRepository;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import com.platform.software.chat.message.dto.MessageReactionSummaryDTO;
import com.platform.software.chat.message.dto.MessageSearchRequestDTO;
import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.chat.message.dto.MessageTypeEnum;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.service.ConversationEventService;
import com.platform.software.chat.message.service.MessageMentionService;
import com.platform.software.chat.message.repository.MessageReactionRepository;
import com.platform.software.chat.message.service.MessageService;
import com.platform.software.chat.message.service.MessageUtilService;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.entity.ChatUserStatus;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.common.model.MediaPathEnum;
import com.platform.software.common.utils.StringUtils;
import com.platform.software.config.aws.CloudPhotoHandlingService;
import com.platform.software.config.aws.DocUploadRequestDTO;
import com.platform.software.config.aws.SignedURLDTO;
import com.platform.software.config.cache.CacheNames;
import com.platform.software.config.cache.RedisCacheService;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.controller.external.IdBasedPageRequest;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomForbiddenException;
import com.platform.software.exception.CustomInternalServerErrorException;
import com.platform.software.utils.CommonUtils;
import com.platform.software.utils.ValidationUtils;
import lombok.RequiredArgsConstructor;
import org.jetbrains.annotations.NotNull;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.platform.software.common.constants.GeneralConstants;
import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;
import java.util.function.Function;

@Service
@RequiredArgsConstructor
public class ConversationService {
    Logger logger = LoggerFactory.getLogger(ConversationService.class);

    private final ConversationRepository conversationRepository;
    private final ConversationParticipantRepository conversationParticipantRepository;
    private final UserService userService;
    private final MessageService messageService;
    private final CloudPhotoHandlingService cloudPhotoHandlingService;
    private final ConversationUtilService conversationUtilService;
    private final MessageMentionService messageMentionService;
    private final ConversationReadStatusService conversationReadStatusService;
    private final MessageReactionRepository messageReactionRepository;
    private final RedisCacheService cacheService;
    private final ConversationParticipantCommandRepository participantCommandRepository;
    private final ConversationReportRepository reportRepository;
    private final WebSocketSessionManager webSocketSessionManager;
    private final ConversationReadStatusRepository conversationReadStatusRepository;
    private final ConversationEventRepository conversationEventRepository;
    private final ConversationEventMessageService conversationEventMessageService;
    private final ConversationEventService conversationEventService;
    private final MessageUtilService messageUtilService;

    /**
     * Builds a ConversationDTO from a Conversation entity.
     *
     * @param conversation the Conversation entity
     * @return a ConversationDTO with participants and messages initialized
     */
    private ConversationDTO buildConversationDTO(Conversation conversation) {
        ConversationDTO conversationDTO = new ConversationDTO(conversation);
        conversationDTO.setMessages(new ArrayList<>());

        List<ConversationParticipantViewDTO> participants = new ArrayList<>();
        for (ConversationParticipant participant : conversation.getConversationParticipants()) {
            ConversationParticipantViewDTO dto = new ConversationParticipantViewDTO(participant);
            dto.setUser(new UserViewDTO(participant.getUser()));
            participants.add(dto);
        }
        conversationDTO.setParticipants(participants);

        return conversationDTO;
    }

    /**
     * Creates a new Conversation entity with the given participants.
     *
     * @param loggedInUserId the ID of the user creating the conversation
     * @param participantIds the IDs of the participants in the conversation
     * @param isGroup whether the conversation is a group conversation
     * @return a new Conversation entity
     */
    public Conversation createConversation(Long loggedInUserId, List<Long> participantIds, boolean isGroup) {
        Conversation conversation = new Conversation();
        conversation.setIsGroup(isGroup);
        conversation.setCreatedBy(userService.getUserOrThrow(loggedInUserId));
        List<ConversationParticipant> participants = new ArrayList<>();

        for (Long participantId : participantIds) {
            ChatUser participant = userService.getUserOrThrow(participantId);

            ConversationParticipant conversationParticipant = new ConversationParticipant();
            conversationParticipant.setUser(participant);

            ConversationParticipantRoleEnum role = ConversationParticipantRoleEnum.MEMBER;
            boolean isParticipantAdmin = participantId.equals(loggedInUserId);
            if (isGroup && isParticipantAdmin) {
                role = ConversationParticipantRoleEnum.ADMIN;
            }

            conversationParticipant.setRole(role);
            participants.add(conversationParticipant);
        }

        conversation.setConversationParticipants(participants);
        return conversation;
    }

    /**
     * Saves the conversation and builds a ConversationDTO from it.
     *
     * @param conversation the Conversation entity to save
     * @return a ConversationDTO with the saved conversation data
     */
    public ConversationDTO saveConversationAndBuildDTO(Conversation conversation) {
        try {
            return buildConversationDTO(conversationRepository.save(conversation));
        } catch (Exception e) {
            logger.error("conversation save failed.", e);
            throw new CustomInternalServerErrorException("Failed to create conversation");
        }
    }

    /**
     * Creates a one-to-one conversation between two users.
     *
     * @param conversationUpsertDTO the DTO containing conversation details
     * @param loggedInUserId        the ID of the user creating the conversation
     * @return a ConversationDTO with the created conversation data
     */
    @Transactional
    public ConversationDTO createOneToOneConversation(ConversationUpsertDTO conversationUpsertDTO, Long loggedInUserId) {
        Optional<ConversationDTO> existingConversation = sendIfConversationAlreadyExists(conversationUpsertDTO, loggedInUserId);
        if (existingConversation.isPresent()) {
            return existingConversation.get();
        }
        if (userService.isInteractionBlockedBetween(loggedInUserId, conversationUpsertDTO.getTargetUserId())) {
            logger.warn("user {} attempted to start a conversation with blocked user {}",
                    loggedInUserId, conversationUpsertDTO.getTargetUserId());
            throw new CustomBadRequestException("Cannot start a conversation with this user!");
        }

        Conversation conversation = createConversation(loggedInUserId, List.of(conversationUpsertDTO.getTargetUserId(), loggedInUserId), false);

        return saveConversationAndBuildDTO(conversation);
    }

    /**
     * Validates that all participants exist in the system.
     *
     * @param participantIds the list of participant IDs to validate
     */
    private void validateParticipantsExist(List<Long> participantIds) {
        long existingUserCount = userService.countUsersByIds(participantIds);
        if (existingUserCount != participantIds.size()) {
            logger.error("Expected {} users but found {} users", participantIds.size(), existingUserCount);
            throw new CustomBadRequestException("One or more participants not found");
        }
    }

    /**
     * Creates a group conversation with the specified participants.
     *
     * @param groupConversationDTO the DTO containing group conversation details
     * @param loggedInUserId       the ID of the user creating the group conversation
     * @return a ConversationDTO with the created group conversation data
     */
    @Transactional
    public ConversationDTO createGroupConversation(
            GroupConversationUpsertDTO groupConversationDTO,
            Long loggedInUserId
    ) {
        if (groupConversationDTO.getParticipantUserIds() == null
                || groupConversationDTO.getParticipantUserIds().isEmpty()) {
            throw new CustomBadRequestException("At least one participant is required for group conversation");
        }

        List<Long> allParticipantIds = new ArrayList<>(groupConversationDTO.getParticipantUserIds());
        if (!allParticipantIds.contains(loggedInUserId)) {
            allParticipantIds.add(loggedInUserId);
        }

        validateParticipantsExist(allParticipantIds);

        Conversation conversation = createConversation(loggedInUserId, allParticipantIds, true);
        conversation.setName(groupConversationDTO.getName().trim());
        conversation.setDescription(groupConversationDTO.getDescription().trim());

        ConversationDTO conversationDTO = saveConversationAndBuildDTO(conversation);

        if (groupConversationDTO.getImageFileName() != null) {
            conversation.setId(conversationDTO.getId());

            ConversationDTO updatedConversationDTO = new ConversationDTO(conversation);

            ConversationDTO conversationDTOWithSignedUrl = conversationUtilService.addSignedImageUrlToConversationDTO(updatedConversationDTO, groupConversationDTO.getImageFileName());
            conversation.setImageIndexedName(conversationDTOWithSignedUrl.getImageIndexedName());
            conversation.setSignedImageUrl(conversationDTOWithSignedUrl.getSignedImageUrl());

            return saveConversationAndBuildDTO(conversation);
        }

        conversationEventService.createMessageWithConversationEvent(conversationDTO.getId(), loggedInUserId, null, ConversationEventType.GROUP_CREATED);

        return conversationDTO;
    }

    /**
     * Checks if a direct conversation already exists between the logged-in user and the target user.
     *
     * @param conversationUpsertDTO the DTO containing conversation details
     * @param loggedInUserId        the ID of the logged-in user
     * @return an Optional containing the ConversationDTO if it exists, otherwise empty
     */
    private Optional<ConversationDTO> sendIfConversationAlreadyExists(ConversationUpsertDTO conversationUpsertDTO, Long loggedInUserId) {
        Optional<Conversation> optionalConversation = conversationRepository
                .findDirectConversationBetweenUsers(loggedInUserId, conversationUpsertDTO.getTargetUserId());
        if (optionalConversation.isPresent()) {
            return conversationParticipantRepository.findConversationById(optionalConversation.get().getId());
        }
        return Optional.empty();
    }

    /**
     * Retrieves conversation details for a specific conversation ID and user ID.
     *
     * @param conversationId the ID of the conversation
     * @param userId         the ID of the user
     * @return a ConversationDTO containing conversation details
     */
    public ConversationDTO getConversationDetails(Long conversationId, Long userId) {

        return conversationParticipantRepository
                .findConversationByUserIdAndConversationId(userId, conversationId)
                .orElseThrow(() -> new CustomBadRequestException(
                        "Cannot find participant conversation with ID %s or don't have permission for this"
                                .formatted(conversationId)));
    }

    /**
     * This is a utility method to simplify converting a page of messages
     * into a list of their IDs.
     *
     * @param messages the paginated collection of {@link Message} entities
     * @return a list of message IDs from the page content
     */
    private static List<Long> extractMessageIds(Page<Message> messages) {
        return messages.getContent().stream()
                .map(Message::getId)
                .toList();
    }

    /**
     * Converts a Page of Message entities to a List of MessageViewDTOs with:
     * - `isSeen` status based on the last seen message ID
     * - `reactionSummary` containing both counts and user reaction types
     *
     * @param messages           the Page of Message entities
     * @param lastSeenMessage    the last message seen by the user (can be null)
     * @param reactionSummaryMap map of message ID to MessageReactionSummaryDTO, may be empty
     * @return a List of MessageViewDTOs with the message data, isSeen status, and reaction summary
     */
    private static List<MessageViewDTO> getMessageViewDTOS(
            Page<Message> messages,
            Message lastSeenMessage,
            Map<Long, MessageReactionSummaryDTO> reactionSummaryMap,
            CloudPhotoHandlingService cloudPhotoHandlingService
    ) {
        Long lastSeenMessageId = (lastSeenMessage != null) ? lastSeenMessage.getId() : null;
        boolean hasReactions = reactionSummaryMap != null;

        return messages.getContent().stream()
                .map(message -> {
                    MessageViewDTO messageViewDTO = new MessageViewDTO(message, lastSeenMessageId);

                    String imageIndexedName = messageViewDTO.getImageIndexedName();
                    if (imageIndexedName != null) {
                        String signedUrl = cloudPhotoHandlingService.getPhotoViewSignedURL(imageIndexedName);
                        messageViewDTO.setSenderSignedImageUrl(signedUrl);
                    }

                    if (hasReactions && !messageViewDTO.getIsUnsend()) {
                        MessageReactionSummaryDTO summary = reactionSummaryMap.get(message.getId());
                        messageViewDTO.setReactionSummary(summary != null ? summary : new MessageReactionSummaryDTO());
                    }
                    return messageViewDTO;
                })
                .toList();
    }

    /**
     * Converts a Message entity to a MessageViewDTO.
     *
     * @param message the Message entity to convert
     * @return a MessageViewDTO with the message data
     */
    private static MessageViewDTO getMessageViewDTO(Message message) {
        MessageViewDTO messageViewDTO = new MessageViewDTO(message);

        return messageViewDTO;
    }

    /**
     * Retrieves all conversations for a specific user with pagination.
     *
     * @param loggedInUserId the ID of the user
     * @param pageable       the pagination information
     * @return a Page of ConversationDTOs containing conversation details
     */
    public Page<ConversationDTO> getAllConversations(Long loggedInUserId, ConversationFilterCriteriaDTO conversationFilterCriteria, Pageable pageable) {
        Page<ConversationDTO> conversations = conversationRepository.findAllConversationsByUserId(loggedInUserId, conversationFilterCriteria, pageable);

        Set<Long> conversationIds = conversations.getContent().stream().map(ConversationDTO::getId).collect(Collectors.toSet());

        Map<Long, MessageViewDTO> lastMessages = conversationRepository.getLatestMessagesForConversations(conversationIds);

        Map<Long, Long> conversationUnreadCounts = conversationReadStatusRepository.findUnreadMessageCountsByConversationIdsAndUserId(
            conversationIds, loggedInUserId
        );

        List<MessageViewDTO> messages = getMessageViewDTOSList(conversations);
        Map<Long, ConversationEvent> conversationEventMap = getMessageConversationEventMap(messages);

        List<ConversationDTO> updatedContent = conversations.getContent().stream()
            .peek(dto -> {
                String imageViewSignedUrl = conversationUtilService.getImageViewSignedUrl(dto.getImageIndexedName());
                dto.setSignedImageUrl(imageViewSignedUrl);
                dto.setImageIndexedName(null);

                Long conversationId = dto.getId();

                MessageViewDTO lastMessage = lastMessages.getOrDefault(conversationId, null);
                dto.setMessages(lastMessage != null ? List.of(lastMessage) : Collections.emptyList());

                long unreadMessageCount = conversationUnreadCounts.getOrDefault(conversationId, 0L);
                dto.setUnreadCount(unreadMessageCount);

                setEventMessageIfExists(loggedInUserId, dto, conversationEventMap);
            })
            .sorted((conv1, conv2) -> {
                MessageViewDTO msg1 = conv1.getMessages() != null && !conv1.getMessages().isEmpty()
                    ? conv1.getMessages().get(0) : null;
                MessageViewDTO msg2 = conv2.getMessages() != null && !conv2.getMessages().isEmpty()
                    ? conv2.getMessages().get(0) : null;

                if (msg1 != null && msg2 != null) {
                    return msg2.getCreatedAt().compareTo(msg1.getCreatedAt());
                }

                if (msg1 != null) {
                    return -1;
                }

                if (msg2 != null) {
                    return 1;
                }

                return conv2.getCreatedAt().compareTo(conv1.getCreatedAt());
            })
            .collect(Collectors.toList());

        Page<ConversationDTO> updatedConversationPageDTO = new PageImpl<>(updatedContent, pageable, conversations.getTotalElements());

        return updatedConversationPageDTO;
    }

    @NotNull
    private static List<MessageViewDTO> getMessageViewDTOSList(Page<ConversationDTO> conversations) {
        List<MessageViewDTO> messages = conversations.getContent().stream()
            .filter(conversationDTO -> conversationDTO.getMessages() != null)
            .map(conversationDTO -> {
                Optional<MessageViewDTO> opMessageViewDTO = conversationDTO.getMessages().stream().findFirst();
                return opMessageViewDTO.orElse(null);
            })
            .filter(Objects::nonNull)
            .toList();
        return messages;
    }

    private void setEventMessageIfExists(Long loggedInUserId, ConversationDTO dto, Map<Long, ConversationEvent> conversationEventMap) {
        if(dto.getMessages() != null) {
            MessageViewDTO msg = dto.getMessages().getFirst();

            if (conversationEventMap.containsKey(msg.getId())) {
                ConversationEvent event = conversationEventMap.get(msg.getId());
                conversationEventMessageService.setEventMessageText(event, msg, loggedInUserId);
            }
        }
    }

    /**
     * Retrieves all participants of a specific conversation with pagination.
     *
     * @param pageable       the pagination information
     * @param conversationId the ID of the conversation
     * @param loggedInUserId the ID of the logged-in user
     * @return a Page of ConversationParticipantViewDTOs containing participant details
     */
    public Page<ConversationParticipantViewDTO> getConversationParticipants(
            Pageable pageable,
            Long conversationId,
            Long loggedInUserId,
            ConversationParticipantFilterCriteriaDTO filterCriteria) {

        conversationUtilService.getConversationParticipantOrThrow(conversationId, loggedInUserId);

        Page<ConversationParticipant> participants = conversationParticipantRepository
                .findConversationParticipantsByCriteria(conversationId, pageable, filterCriteria);

        return participants.map(participant -> {
            ConversationParticipantViewDTO participantViewDTO = new ConversationParticipantViewDTO(participant);
            UserViewDTO user = new UserViewDTO(participant.getUser());

            String imageIndexedName = participant.getUser().getImageIndexedName();
            if (imageIndexedName != null) {
                String signedImageUrl = cloudPhotoHandlingService.getPhotoViewSignedURL(imageIndexedName);
                user.setSignedImageUrl(signedImageUrl);
            }

            participantViewDTO.setUser(user);
            return participantViewDTO;
        });
    }

    public enum MuteDuration {
        FIFTEEN_MINUTES("15m", ChronoUnit.MINUTES, 15),
        ONE_HOUR("1h", ChronoUnit.HOURS, 1),
        ONE_DAY("1d", ChronoUnit.DAYS, 1),
        ALWAYS("always", ChronoUnit.DAYS, 100);

        private final String key;
        private final ChronoUnit unit;
        private final long amount;

        MuteDuration(String key, ChronoUnit unit, long amount) {
            this.key = key;
            this.unit = unit;
            this.amount = amount;
        }

        public String getKey() {
            return key;
        }

        public ChronoUnit getUnit() {
            return unit;
        }

        public long getAmount() {
            return amount;
        }

        public static MuteDuration fromKey(String key) {
            for (MuteDuration duration : values()) {
                if (duration.key.equalsIgnoreCase(key)) {
                    return duration;
                }
            }
            return null;
        }
    }

    /**
     * Toggles the mute status of a conversation for a specific user.
     *
     * @param conversationId the ID of the conversation
     * @param userId         the ID of the user
     * @param durationKey     the datetime until which the conversation should be
     *                       muted; null to unmute
     * @return true if the mute status was updated, false if no change was needed
     */
    @Transactional
    public boolean toggleMuteConversation(Long conversationId, Long userId, String durationKey) {
        ConversationParticipant participant = conversationUtilService.getConversationParticipantOrThrow(conversationId,
                userId);

        ZonedDateTime mutedUntil = null;

        if (durationKey != null) {
            MuteDuration muteDuration = MuteDuration.fromKey(durationKey);
            if (muteDuration == null) {
                throw new CustomBadRequestException("Invalid mute duration: " + durationKey);
            }
            mutedUntil = ZonedDateTime.now().plus(muteDuration.getAmount(), muteDuration.getUnit());
        }

        boolean isUnmuting = mutedUntil == null;
        boolean alreadyUnmuted = participant.getMutedUntil() == null;

        if (isUnmuting && alreadyUnmuted) {
            return false;
        }

        if (Objects.equals(participant.getMutedUntil(), mutedUntil)) {
            return false;
        }
        participant.setMutedUntil(mutedUntil);

        try {
            conversationParticipantRepository.save(participant);
        } catch (Exception e) {
            logger.error("Failed to {} conversation {} for user {}", isUnmuting ? "unmute" : "mute", conversationId,
                    userId, e);
            throw new CustomInternalServerErrorException(
                    "Failed to " + (isUnmuting ? "unmute" : "mute") + " conversation");
        }

        return true;
    }
    /**
     * Retrieves messages from a specific conversation with pagination.
     * Each message includes seen status and reaction summary with current user's reaction types.
     *
     * @param idBasedPageRequest       the pagination information
     * @param conversationId the ID of the conversation
     * @param loggedInUserId the ID of the logged-in user
     * @return a Page of MessageViewDTOs containing message details
     */
    public Page<MessageViewDTO> getMessages(IdBasedPageRequest idBasedPageRequest, Long conversationId, Long loggedInUserId){
        ConversationParticipant loggedInParticipant =
                conversationUtilService.getConversationParticipantOrThrow(conversationId, loggedInUserId);

        Page<Message> messages = messageService.getRecentVisibleMessages(idBasedPageRequest, conversationId, loggedInParticipant);

        return getMessageViewDTOs(messages, conversationId, loggedInUserId);
    }

    /**
     * Retrieves message page by message id.
     * Each message includes seen status and reaction summary with current user's reaction types.
     *
     * @param messageId       message id
     * @param conversationId the ID of the conversation
     * @param loggedInUserId the ID of the logged-in user
     * @return a Page of MessageViewDTOs containing message details
     */
    public Page<MessageViewDTO> getMessagePageById(Long messageId, Long conversationId, Long loggedInUserId){
        ConversationParticipant loggedInParticipant =
                conversationUtilService.getConversationParticipantOrThrow(conversationId, loggedInUserId);

        Page<Message> messages = messageService.getRecentVisibleMessages(messageId, conversationId, loggedInParticipant);

        return getMessageViewDTOs(messages, conversationId, loggedInUserId);
    }

    /**
     * Converts a page of {@link Message} entities into a page of {@link MessageViewDTO} objects.
     *
     * @param messages       list of messages
     * @param conversationId the ID of the conversation
     * @param loggedInUserId the ID of the logged-in user
     * @return a Page of MessageViewDTOs containing message details
     */
    private Page<MessageViewDTO> getMessageViewDTOs(Page<Message> messages, Long conversationId, Long loggedInUserId) {

        Message lastSeenMessage = conversationReadStatusService.getLastSeenMessageOrNull(conversationId, loggedInUserId);

        Long lastReadMessageId = getLastReadMessageIdByParticipants(conversationId, loggedInUserId);

        List<Long> messageIds = extractMessageIds(messages);

        Map<Long, MessageReactionSummaryDTO> reactionSummaryMap =
                messageReactionRepository.findReactionSummaryWithUserReactions(messageIds, loggedInUserId);

        List<MessageViewDTO> messageViewDTOS = getMessageViewDTOS(messages, lastSeenMessage, reactionSummaryMap, cloudPhotoHandlingService);
        messageMentionService.appendMessageMentions(messageViewDTOS);

        Map<Long, ConversationEvent> conversationEventMap = getMessageConversationEventMap(messageViewDTOS);
        
        Map<Long, Message> messageMap = messages.getContent().stream()
        .collect(Collectors.toMap(Message::getId, Function.identity()));
    
         List<MessageViewDTO> enrichedDTOs = messageViewDTOS.stream()
            .map(dto -> {
                Message matchedMessage = messageMap.get(dto.getId());
                List<MessageAttachmentDTO> attachmentDTOs = new ArrayList<>();

                if (conversationEventMap.containsKey(dto.getId())) {
                    ConversationEvent event = conversationEventMap.get(dto.getId());
                    conversationEventMessageService.setEventMessageText(event, dto, loggedInUserId);
                }

                boolean isReadByEveryone = lastReadMessageId != null && lastReadMessageId >= dto.getId();
                dto.setIsReadByEveryone(isReadByEveryone);

                if (matchedMessage == null || matchedMessage.getIsUnsend() ) {
                    return dto;
                }

                List<MessageAttachment> attachments = matchedMessage.getAttachments();

                if (attachments == null || attachments.isEmpty()) {
                    return dto;
                }

                for (MessageAttachment attachment : attachments) {
                    try {
                        String fileViewSignedURL = cloudPhotoHandlingService
                            .getPhotoViewSignedURL(attachment.getIndexedFileName());

                        MessageAttachmentDTO messageAttachmentDTO = new MessageAttachmentDTO();
                        messageAttachmentDTO.setId(attachment.getId());
                        messageAttachmentDTO.setFileUrl(fileViewSignedURL);
                        messageAttachmentDTO.setIndexedFileName(attachment.getIndexedFileName());
                        messageAttachmentDTO.setOriginalFileName(attachment.getOriginalFileName());
                        attachmentDTOs.add(messageAttachmentDTO);
                    } catch (Exception e) {
                        logger.error("failed to add file {} to zip: {}", attachment.getOriginalFileName(), e.getMessage());
                        throw new CustomInternalServerErrorException("Failed to get conversation!");
                    }
                }
                dto.setMessageAttachments(attachmentDTOs);
                return dto;
            })
            .collect(Collectors.toList());
        return new PageImpl<>(enrichedDTOs, messages.getPageable(), messages.getTotalElements());
    }

    private Map<Long, ConversationEvent> getMessageConversationEventMap(Collection<MessageViewDTO> messages) {
        Set<Long> systemEventIds = messages.stream()
            .filter(message -> message.getMessageType() != null && message.getMessageType() == MessageTypeEnum.SYSTEM_EVENT)
            .map(MessageViewDTO::getId)
            .collect(Collectors.toSet());

        Map<Long, ConversationEvent> conversationEventMap = conversationEventRepository.findByMessageIdsAsMap(systemEventIds);
        return conversationEventMap;
    }

    /**
     * Returns the lowest last-read message ID among all participants in the conversation,
     * excluding the logged-in user.
     *
     * @param conversationId the ID of the conversation whose read statuses are being checked
     * @param loggedInUserId the ID of the user making the request, whose own read status is excluded
     * @return the smallest last-read message ID among other participants, or {@code null}
     *         if no other participants have read statuses recorded or if any participant has null
     */
    private Long getLastReadMessageIdByParticipants(Long conversationId, Long loggedInUserId) {
        // read statuses of every participant, with their user id and last read message id
        Map<Long, Long> userReadStatuses =
            new HashMap<>(conversationReadStatusRepository.findLastReadMessageIdsByConversationId(conversationId));
        userReadStatuses.remove(loggedInUserId);

        // If any participant has null last-read message ID, return null
        if (userReadStatuses.containsValue(null)) {
            return null;
        }

        return userReadStatuses.values()
            .stream()
            .min(Long::compare)
            .orElse(null);
    }

    /**
     * Archives a conversation for a specific user.
     *
     * @param conversationId the ID of the conversation to archive
     * @param loggedInUserId the ID of the user archiving the conversation
     * @return the updated ConversationParticipant entity
     */
    @Transactional
    public void archiveConversationById(Long conversationId, long loggedInUserId) {
        long updatedCount = participantCommandRepository.toggleArchived(conversationId, loggedInUserId);
        if (updatedCount == 0) throw new CustomBadRequestException("Not a participant");
    }

    /**
     * Deletes a conversation by its ID for a specific user.
     *
     * @param id     the ID of the conversation to delete
     * @param userId the ID of the user deleting the conversation
     * @return the deleted Conversation entity
     */
    public Conversation deleteConversationById(Long id, Long userId) {
        Conversation conversation = conversationRepository.findByIdAndCreatedById(id, userId).orElseThrow(() -> {
            logger.warn("invalid conversation id {} provided or the user {} doesn't have permission to delete it", id, userId);
            throw new CustomBadRequestException("Conversation does not exist or you don't have permission to delete it!");
        });

        conversation.setDeleted(true);
        try {
            return conversationRepository.save(conversation);
        } catch (Exception exception) {
            logger.error("failed to delete conversation id: {}", id, exception);
            throw new CustomBadRequestException("Failed to delete conversation");
        }
    }

    /**
     * Manages admin privileges for a user in a group conversation.
     *
     * @param loggedInUserId         the ID of the logged-in user
     * @param conversationId         the ID of the conversation
     * @param groupRoleManageRequest the request DTO containing user ID and admin status
     */
    @Transactional
    public void manageAdminPrivileges(Long loggedInUserId, Long conversationId, GroupRoleManageRequestDTO groupRoleManageRequest) {
        ValidationUtils.validate(groupRoleManageRequest);
        Long targetUserId = groupRoleManageRequest.getUserId();

        conversationUtilService.getLoggedInUserIfAdminAndValidConversation(loggedInUserId, conversationId);
        ConversationParticipant targetParticipant = conversationUtilService.getConversationParticipantOrThrow(conversationId, targetUserId);

        ConversationParticipantRoleEnum newRole = groupRoleManageRequest.getMakeAdmin()
                ? ConversationParticipantRoleEnum.ADMIN
                : ConversationParticipantRoleEnum.MEMBER;

        if (targetParticipant.getRole().equals(newRole)) {
            throw new CustomBadRequestException("This user is already %s".formatted(newRole));
        }

        // if participant is getting stripped from admin role, need to verify that user isn't the last admin
        if (newRole.equals(ConversationParticipantRoleEnum.MEMBER)) {
            getParticipantIfAllowedToRemoveAdminRole(groupRoleManageRequest.getUserId(), conversationId);
        }

        targetParticipant.setRole(newRole);

        try {
            conversationParticipantRepository.save(targetParticipant);

            conversationEventService.createMessageWithConversationEvent(
                conversationId, loggedInUserId, List.of(targetUserId),
                groupRoleManageRequest.getMakeAdmin()
                    ? ConversationEventType.USER_PROMOTED_TO_ADMIN
                    : ConversationEventType.USER_REMOVED_FROM_ADMIN
            );
        } catch (Exception e) {
            logger.error("Failed to update participant role for userId: {} in conversationId: {}",
                    targetUserId, conversationId, e);
            throw new CustomInternalServerErrorException("Failed to manage privileges");
        }
    }

    /**
     * Allows a user to leave a conversation, provided they are not the last admin in a group conversation.
     *
     * @param userId         the ID of the user leaving the conversation
     * @param conversationId the ID of the conversation to leave
     */
    @Transactional
    public void leaveConversation(Long userId, Long conversationId) {
        ConversationParticipantViewDTO leavingParticipant = getParticipantIfAllowedToRemoveAdminRole(userId, conversationId);

        try {
            conversationParticipantRepository.updateIsActiveById(leavingParticipant.getId(), false);

            conversationEventService.createMessageWithConversationEvent(conversationId, userId, List.of(userId), ConversationEventType.USER_LEFT);
        } catch (Exception e) {
            logger.error("user: %s cannot leave the conversation due to an error".formatted(userId), e);
            throw new CustomInternalServerErrorException("Failed to leave the conversation");
        }
    }

    /**
     * Validates if a participant can be removed from admin role in a conversation.
     *
     * @param userId         the ID of the participant user
     * @param conversationId the ID of the conversation
     * @return the ConversationParticipantViewDTO of the participant being removed
     */
    private ConversationParticipantViewDTO getParticipantIfAllowedToRemoveAdminRole(Long userId, Long conversationId) {
        ConversationDTO conversationDTO = conversationUtilService.getConversationDTOOrThrow(userId, conversationId);
        return validateParticipantAdminRoleRemoval(userId, conversationId, conversationDTO);
    }

    /**
     * Adds new participants to a conversation, ensuring no duplicates and that the user exists.
     *
     * @param initiatorUserId        the ID of the initiator user
     * @param conversationId         the ID of the conversation to add participants to
     * @param joinRequest the request DTO containing user IDs to add
     */
    @Transactional
    public void addParticipantsToConversation(Long initiatorUserId, Long conversationId, JoinParticipantRequestDTO joinRequest) {
        // TODO: Currently, if a participant is rejoined, their entire conversation history becomes visible again.
        //       Fix this later by introducing a new table to store participant lifecycle details

        ValidationUtils.validate(joinRequest);

        ConversationParticipant adminParticipant =
                conversationUtilService.getLoggedInUserIfAdminAndValidConversation(initiatorUserId, conversationId);
        Conversation conversation = adminParticipant.getConversation();

        List<ConversationParticipant> existingParticipants =
                findDuplicateParticipants(conversationId, joinRequest);

        ParticipantProcessingResult participantProcessingResult = processExistingParticipants(existingParticipants);

        List<Long> newUserIds = joinRequest.getUserIds().stream()
                .filter(userId -> !participantProcessingResult.existingUserIds().contains(userId))
                .toList();

        Map<Long, ChatUser> validUsers = conversationUtilService.validateUsersTryingToAdd(newUserIds);

        List<ConversationParticipant> participantsToSave = new ArrayList<>(participantProcessingResult.reactivated());
        for (Long userId : newUserIds) {
            participantsToSave.add(createParticipant(validUsers.get(userId), conversation));
        }

        try {
            conversationParticipantRepository.saveAll(participantsToSave);

            conversationEventService.createMessageWithConversationEvent(conversationId, initiatorUserId, joinRequest.getUserIds(), ConversationEventType.USER_ADDED);
        } catch (Exception e) {
            logger.error("Failed to add participants. conversationId={}, initiator={}", conversationId, initiatorUserId, e);
            throw new CustomBadRequestException("Some users are already participants.");
        }
    }

    /**
     * Processes a list of existing participants in a conversation.
     *
     * This method does the following:
     * - Collects all user IDs from the given participants.
     * - Reactivates participants that are inactive by setting them active and clearing their inactiveFrom field.
     * - Throws a CustomBadRequestException if any active participants are found.
     *
     * @param existingParticipants the participants already found in the conversation that match the join request
     * @return a ParticipantProcessingResult containing the set of existing user IDs and the list of reactivated participants
     * @throws CustomBadRequestException if active participants are detected in the given list
     */
    private ParticipantProcessingResult processExistingParticipants(List<ConversationParticipant> existingParticipants) {
        List<ConversationParticipant> activeParticipants = new ArrayList<>();
        List<ConversationParticipant> reactivated = new ArrayList<>();
        Set<Long> existingUserIds = new HashSet<>();

        for (ConversationParticipant p : existingParticipants) {
            existingUserIds.add(p.getUser().getId());
            if (p.getIsActive()) {
                activeParticipants.add(p);
            } else {
                p.setIsActive(true);
                p.setInactiveFrom(null);
                reactivated.add(p);
            }
        }

        if (!activeParticipants.isEmpty()) {
            String names = activeParticipants.stream()
                    .map(p -> p.getUser().getFirstName())
                    .collect(Collectors.joining(", "));
            throw new CustomBadRequestException("Cannot add active participants: " + names);
        }

        return new ParticipantProcessingResult(existingUserIds, reactivated);
    }



    /**
     * Creates a ConversationParticipant entity for a user in a conversation.
     *
     * @param user         the ChatUser to create a participant for
     * @param conversation the Conversation to associate the participant with
     * @return a new ConversationParticipant entity
     */
    private static ConversationParticipant createParticipant(ChatUser user, Conversation conversation) {
        ConversationParticipant conversationParticipant = new ConversationParticipant();
        conversationParticipant.setUser(user);
        conversationParticipant.setConversation(conversation);
        conversationParticipant.setRole(ConversationParticipantRoleEnum.MEMBER);
        return conversationParticipant;
    }

    /**
     * Validates that no duplicate participants are being added to the conversation.
     *
     * @param conversationId         the ID of the conversation
     * @param joinParticipantRequest the request DTO containing user IDs to add
     */
    private List<ConversationParticipant> findDuplicateParticipants(Long conversationId, JoinParticipantRequestDTO joinParticipantRequest) {
        Map<Long, ConversationParticipant> participantMap = conversationUtilService
                .getConversationParticipantMap(conversationId, joinParticipantRequest.getUserIds());

       return new ArrayList<>(participantMap.values());
    }

    /**
     * this will check if a group has at-least 1 more admin, if the leaving user is an admin
     * because a group must have an at-least 1 admin
     */
    private ConversationParticipantViewDTO validateParticipantAdminRoleRemoval(Long leavingUserId, Long conversationId, ConversationDTO conversationDTO) {
        boolean isLeavingParticipantAdmin = false;
        ConversationParticipantViewDTO leavingParticipant = null;
        int adminCount = 0;
        for (ConversationParticipantViewDTO participant : conversationDTO.getParticipants()) {
            boolean isAdmin = ConversationParticipantRoleEnum.ADMIN.equals(participant.getRole());
            boolean isLeavingUser = participant.getUser().getId().equals(leavingUserId);

            if (isAdmin) {
                adminCount++;
            }

            if (isLeavingUser) {
                leavingParticipant = participant;
                isLeavingParticipantAdmin = isAdmin;
            }
        }

        if (isLeavingParticipantAdmin && adminCount <= 1) {
            logger.error("user: {} is leaving participant and only admin for conversation {}", leavingUserId, conversationId);
            throw new CustomBadRequestException("Conversation must have at least one admin");
        }
        return leavingParticipant;
    }

    /**
     * Updates the group conversation information such as name.
     *
     * @param adminUserId          the ID of the user updating the group info
     * @param conversationId       the ID of the conversation to update
     * @param groupConversationDTO the DTO containing new group information
     * @return a ConversationDTO with updated group information
     */
    public ConversationDTO updateGroupInfo(Long adminUserId, Long conversationId, GroupConversationUpsertDTO groupConversationDTO) {
        if (StringUtils.isEmpty(groupConversationDTO.getName())) {
            throw new CustomBadRequestException("Group name cannot be empty!");
        }
        ConversationParticipant adminParticipant = conversationUtilService.getLoggedInUserIfAdminAndValidConversation(adminUserId, conversationId);
        Conversation conversation = adminParticipant.getConversation();

        String newName = groupConversationDTO.getName().trim();
        boolean isGroupNameChanged = !newName.equals(conversation.getName());
        boolean isGroupDescriptionChanged = !groupConversationDTO.getDescription().equals(conversation.getDescription());

        conversation.setName(newName);
        conversation.setDescription(groupConversationDTO.getDescription());
        try {
            conversationRepository.save(conversation);
            setGroupUpdateChangeEvents(adminUserId, isGroupNameChanged, conversation, isGroupDescriptionChanged);

            cacheService.evictByLastPartsForCurrentWorkspace(List.of(CacheNames.GET_CONVERSATION_META_DATA + ":" + conversation.getId()));

            return buildConversationDTO(conversation);
        } catch (Exception e) {
            logger.error("failed to update group info for conversationId: {} by user id: {}",
                    conversationId, adminUserId, e);
            throw new CustomInternalServerErrorException("Failed to update group name!");
        }
    }

    private void setGroupUpdateChangeEvents(Long adminUserId, boolean isGroupNameChanged, Conversation conversation, boolean isGroupDescriptionChanged) {
        Long conversationId = conversation.getId();

        if (isGroupNameChanged) {
            conversationEventService.createMessageWithConversationEvent(
                conversationId, adminUserId, null, ConversationEventType.GROUP_RENAMED
            );
        }

        if (isGroupNameChanged || isGroupDescriptionChanged) {
            conversationEventService.createMessageWithConversationEvent(
                conversationId, adminUserId, null, ConversationEventType.GROUP_DESCRIPTION_CHANGED
            );
        }
    }

    /**
     * generate signed image url for uploading the image s3 bucket.
     *
     * @param loggedInUserId       the ID of the user updating the group info
     * @param conversationId       the ID of the conversation to update
     * @param docUploadRequestDTO the DTO containing image details
     * @return a SignedURLDTO with signed url and new index
     */
    public SignedURLDTO generateSignedURLForGroupIconUpload(Long loggedInUserId, Long conversationId, DocUploadRequestDTO docUploadRequestDTO) {
        ConversationParticipant adminParticipant = conversationUtilService.getLoggedInUserIfAdminAndValidConversation(loggedInUserId, conversationId);
        Conversation conversation = adminParticipant.getConversation();

        String newFileName = (conversationId) + "_" + docUploadRequestDTO.getFileNames().getFirst();

        SignedURLDTO imageSignedDTO = cloudPhotoHandlingService.getPhotoUploadSignedURL(MediaPathEnum.GROUP_PICTURE, newFileName);

        if (imageSignedDTO != null && CommonUtils.isNotEmptyObj(imageSignedDTO.getIndexedFileName())) {
            conversation.setImageIndexedName(imageSignedDTO.getIndexedFileName());
            try {
                conversationRepository.save(conversation);
                cacheService.evictByLastPartsForCurrentWorkspace(List.of(CacheNames.GET_CONVERSATION_META_DATA + ":" + conversation.getId()));
            } catch (Exception exception) {
                logger.error("failed to update group icon for conversationId: {} by user id: {}",
                        conversationId, loggedInUserId, exception);
                throw new CustomInternalServerErrorException("Failed to update group icon!");
            }
        }
        return imageSignedDTO;
    }

    /**
     * Pins a message in a conversation for a specific user.
     *
     * @param userId         the ID of the user pinning the message
     * @param conversationId the ID of the conversation
     * @param messageId      the ID of the message to pin
     */
    @Transactional
    public void togglePinMessage(Long userId, Long conversationId, Long messageId) {
        conversationUtilService.getConversationParticipantOrThrow(conversationId, userId);

        Message message = messageUtilService.getMessageOrThrow(conversationId, messageId);
        Conversation conversation = conversationUtilService.getConversationOrThrow(conversationId);

        boolean alreadyPinned = Optional.ofNullable(conversation.getPinnedMessage())
                .map(Message::getId)
                .filter(id -> id.equals(messageId))
                .isPresent();

        conversation.setPinnedMessage(alreadyPinned ? null : message);

        try {
            conversationRepository.save(conversation);
            cacheService.evictByPatternsForCurrentWorkspace(List.of(CacheNames.GET_CONVERSATION_META_DATA));
        } catch (Exception exception) {
            logger.error("Failed to pin messageId: {} in conversationId: {}", messageId, conversationId, exception);
            throw new CustomBadRequestException("Failed to pin message in conversation");
        }
    }

    /**
     * Retrieves the pinned message from a conversation for a specific user.
     *
     * @param userId         the ID of the logged-in user
     * @param conversationId the ID of the conversation
     * @return a MessageViewDTO containing the pinned message details
     */
    public MessageViewDTO getPinnedMessage(Long userId, Long conversationId) {
        conversationUtilService.getConversationParticipantOrThrow(conversationId, userId);

        Conversation conversation = conversationUtilService.getConversationOrThrow(conversationId);

        if (conversation.getPinnedMessage() == null) {
            throw new CustomBadRequestException("No pinned Messages");
        }

        return getMessageViewDTO(conversation.getPinnedMessage());
    }

    /**
     * Unpins a message in a conversation for a specific user.
     *
     * @param userId         the ID of the logged-in user
     * @param conversationId the ID of the conversation
     */
    @Transactional
    public void unpinMessage(Long userId, Long conversationId) {
        conversationUtilService.getConversationParticipantOrThrow(conversationId, userId);

        Conversation conversation = conversationUtilService.getConversationOrThrow(conversationId);

        if (conversation.getPinnedMessage() == null) {
            return;
        }

        conversation.setPinnedMessage(null);

        try {
            conversationRepository.save(conversation);
        } catch (Exception exception) {
            logger.error("Failed to unpin message in conversationId: {}", conversationId, exception);
            throw new CustomBadRequestException("Failed to unpin message in conversation");
        }
    }

    /**
     * Toggles the favorite status of a conversation for a specific user.
     *
     * @param conversationId the ID of the conversation
     * @param userId         the ID of the logged-in user
     */
    @Transactional
    public boolean toggleFavoriteConversation(Long conversationId, Long userId) {
        long updated = participantCommandRepository.toggleFavorite(conversationId, userId);
        if (updated == 0) throw new CustomBadRequestException("Not a participant");
        return true;
    }

    /**
     * Retrieves favorite conversations for a specific user with pagination.
     *
     * @param userId   the ID of the user
     * @param pageable the pagination information
     * @return a Page of ConversationDTOs containing favorite conversation details
     */
    public Page<ConversationDTO> getFavoriteConversations(Long userId, Pageable pageable) {
        return conversationParticipantRepository
                .getFavouriteConversationsByUserId(userId, pageable);
    }

    /**
     * Retrieves the profile of the other user in a one-to-one conversation.
     *
     * @param conversationId   the ID of the conversation
     * @param requestingUserId the ID of the logged-in user
     * @return a ConversationOneToOneProfileDTO containing the other user's profile information
     */
    public ConversationOneToOneProfileDTO getOtherUserProfileInOneToOneConversation(Long conversationId, Long requestingUserId) {
        ConversationParticipant me = conversationUtilService.getConversationParticipantOrThrow(conversationId, requestingUserId);
        if (me.getIsDeleted()) throw new CustomBadRequestException("Can't access deleted conversation");

        DirectOtherMetaDTO meta = conversationRepository
                .findDirectOtherMeta(conversationId, requestingUserId)
                .orElseThrow(() -> new CustomBadRequestException("No other user found or not a direct conversation"));

        String imageViewSignedUrl = conversationUtilService.getImageViewSignedUrl(meta.getImageIndexedName());
        meta.setSignedImageUrl(imageViewSignedUrl);
        meta.setImageIndexedName(null);

        ConversationOneToOneProfileDTO dto = new ConversationOneToOneProfileDTO(/* construct from meta’s user fields */);
        dto.setUserView(new UserViewDTO(meta.getOtherUserId(), meta.getFirstName(), meta.getLastName(), meta.getSignedImageUrl()));
        dto.setBlocked(meta.isBlocked());
        dto.setPinned(me.getIsPinned());
        dto.setFavorite(me.getIsFavorite());
        return dto;
    }


    @Transactional
    public boolean togglePinConversation(Long conversationId, Long loggedInUserId) {
        long updatedCount = participantCommandRepository.togglePinned(conversationId, loggedInUserId);
        if (updatedCount == 0) throw new CustomBadRequestException("Not a participant");
        return true;
    }

    public Page<ConversationDTO> getPinnedConversations(Long loggedInUserId, Pageable pageable) {
        Page<ConversationDTO> pinnedConversations = conversationParticipantRepository
                .findPinnedConversationsByUserId(loggedInUserId, pageable);
        return pinnedConversations;
    }

    /**
     * Search conversations page.
     *
     * @param userId                  the user id
     * @param messageSearchRequestDTO the message search request dto
     * @param pageable                the pageable
     * @return the page
     */
    public Page<ConversationDTO> searchConversations(Long userId, MessageSearchRequestDTO messageSearchRequestDTO, Pageable pageable) {
        Page<ConversationDTO> conversationDTOS = conversationParticipantRepository
                .findConversationsByMatchingKeyword(messageSearchRequestDTO.getSearchKeyword(), userId, pageable);
        return conversationDTOS;
    }

    /**
     * Retrieves the group profile of a conversation.
     *
     * @param conversationId   the ID of the conversation
     * @param requestingUserId the ID of the logged-in user
     * @return a ConversationGroupProfileDTO containing group profile information
     */
    public ConversationGroupProfileDTO getConversationGroupProfile(Long conversationId, Long requestingUserId) {
        ConversationParticipant requestedParticipant = conversationUtilService
                .getConversationParticipantOrThrow(conversationId, requestingUserId);

        if (requestedParticipant.getIsDeleted()) {
            throw new CustomBadRequestException("Can't access deleted conversation");
        }

        Conversation conversation = conversationUtilService.getConversationOrThrow(conversationId);
        String imageViewSignedUrl = conversationUtilService.getImageViewSignedUrl(conversation.getImageIndexedName());
        conversation.setSignedImageUrl(imageViewSignedUrl);

        if (!conversation.getIsGroup()) {
            throw new CustomBadRequestException("Cannot get group profile for a direct conversation");
        }

        Page<ConversationParticipant> participants = conversationParticipantRepository
                .findByConversationId(conversationId, PageRequest.of(0, GeneralConstants.DEFAULT_PARTICIPANT_LIST_SIZE));

        Page<ConversationParticipantViewDTO> conversationParticipants = participants.map(participant -> {
            ConversationParticipantViewDTO participantViewDTO = new ConversationParticipantViewDTO(participant);
            UserViewDTO user = new UserViewDTO(participant.getUser());
            participantViewDTO.setUser(user);
            return participantViewDTO;
        });

        return new ConversationGroupProfileDTO(conversation, requestedParticipant, conversationParticipants);
    }

    public ChatSummaryDTO getChatSummary(Long userId) {
        return conversationRepository.getChatSummaryForUser(userId);
    }


    /**
     * Deletes a conversation participant.
     *
     * @param userId         the ID of the user to delete from the conversation
     * @param conversationId the ID of the conversation
     */
    @Transactional
    public void deleteConversationForCurrentUser(Long userId, Long conversationId) {

        ConversationParticipant participant = conversationUtilService.getConversationParticipantOrThrow(conversationId, userId);

        if (Boolean.TRUE.equals(participant.getIsDeleted())) {
            return;
        }

        try {
            participant.setIsDeleted(true);
            participant.setLastDeletedTime(ZonedDateTime.now());
            conversationParticipantRepository.save(participant);
            cacheService.evictByLastPartsForCurrentWorkspace(List.of(CacheNames.GET_CONVERSATION_META_DATA+":" + conversationId));
        } catch (Exception e) {
            logger.error("Failed to delete conversation participant for userId: {} in conversationId: {}", userId, conversationId, e);
            throw new CustomBadRequestException("Failed to delete conversation participant");
        }
    }

    /**
     * Retrieves metadata for a conversation, including its ID, name, group status, and image.
     *
     * @param conversationId the ID of the conversation
     * @param userId         the ID of the user requesting the metadata
     * @return a ConversationMetaDataDTO containing conversation metadata
     */
    public ConversationMetaDataDTO getConversationMetaData(Long conversationId, Long userId) {
        ConversationMetaDataDTO conversationMetaDataDTO = conversationUtilService.getConversationMetaDataDTO(conversationId, userId);
        conversationMetaDataDTO.setIsActive(conversationRepository.getIsActiveByConversationIdAndUserId(conversationId, userId));

        if (!conversationMetaDataDTO.getIsGroup()) {
            conversationMetaDataDTO.setImageIndexedName(null);

            DirectOtherMetaDTO directOtherMeta = conversationRepository
                    .findDirectOtherMeta(conversationId, userId)
                    .orElseThrow(() -> new CustomBadRequestException(
                            "No other user found in this one-to-one conversation or conversation is a group."
                    ));

            String imageIndexedName = directOtherMeta.getImageIndexedName();
            String signedImageIndexedName = conversationUtilService.getImageViewSignedUrl(imageIndexedName);

            conversationMetaDataDTO.setName(directOtherMeta.getFullName());
            conversationMetaDataDTO.setIsBlocked(directOtherMeta.isBlocked());
            if (!directOtherMeta.isBlocked()) {
                conversationMetaDataDTO.setSignedImageUrl(signedImageIndexedName);
            } else {
                conversationMetaDataDTO.setSignedImageUrl(null);
            }

            ChatUserStatus status = webSocketSessionManager.getUserChatStatus(
                    WorkspaceContext.getCurrentWorkspace(),
                    directOtherMeta.getEmail()
            );
            conversationMetaDataDTO.setChatUserStatus(status);

        } else {
            String imageIndexedName = conversationMetaDataDTO.getImageIndexedName();
            String signedImageIndexedName = conversationUtilService.getImageViewSignedUrl(imageIndexedName);
            conversationMetaDataDTO.setSignedImageUrl(signedImageIndexedName);
        }

        return conversationMetaDataDTO;
    }

    /**
     * Removes a participant from a conversation. Only admins can remove participants.
     *
     * @param requestingUserId      the ID of the user making the request
     * @param conversationId        the ID of the conversation
     * @param participantIdToRemove the ID of the participant to remove
     */
    @Transactional
    public void removeParticipantFromConversation(Long requestingUserId, Long conversationId, Long participantIdToRemove) {
        ConversationParticipant requestedParticipant = conversationUtilService
                .getConversationParticipantOrThrow(conversationId, requestingUserId);

        if (!requestedParticipant.getRole().equals(ConversationParticipantRoleEnum.ADMIN)) {
            throw new CustomForbiddenException("Only admins can remove participants");
        }

        if(Objects.equals(requestedParticipant.getId(), participantIdToRemove)){
            throw new CustomBadRequestException("You cannot remove yourself. Use leave conversation instead.");
        }

        try {
            conversationParticipantRepository.updateIsActiveById(participantIdToRemove, false);

            conversationEventService.createMessageWithConversationEvent(conversationId, requestingUserId, List.of(participantIdToRemove), ConversationEventType.USER_REMOVED);
        } catch (Exception e) {
            logger.error("Cant remove user: %s due to an error".formatted(participantIdToRemove), e);
            throw new CustomInternalServerErrorException("Failed to remove user from conversation");
        }
    }

    /**
     * Holds the result of processing existing participants in a conversation.
     * <p>
     * - {@code existingUserIds}: all user IDs already present in the conversation (active or inactive).<br>
     * - {@code reactivated}: list of participants that were previously inactive and have now been reactivated.
     * </p>
     */
    private record ParticipantProcessingResult(Set<Long> existingUserIds,
                                               List<ConversationParticipant> reactivated) {
    }

    /**
     * Reports a conversation for a specific reason.
     *
     * @param userId         the ID of the user reporting the conversation
     * @param conversationId the ID of the conversation being reported
     * @param reason         the reason for the report
     * @throws CustomBadRequestException if the user is not a participant or
     *                                   conversation doesn't exist
     */
    @Transactional
    public void reportConversation(Long userId, Long conversationId, ConversationReportReasonEnum reason) {
        conversationUtilService.getConversationParticipantOrThrow(conversationId, userId);

        Conversation conversation = conversationUtilService.getConversationOrThrow(conversationId);
        ChatUser reportingUser = userService.getUserOrThrow(userId);

        ConversationReport report = new ConversationReport();
        report.setConversation(conversation);
        report.setUser(reportingUser);
        report.setReason(reason);

        try {
            reportRepository.save(report);
        } catch (Exception e) {
            logger.error("Failed to save conversation report for userId: {} conversationId: {} reason: {}",
                    userId, conversationId, reason, e);
            throw new CustomInternalServerErrorException("Failed to report conversation");
        }
    }

    /**
     * Gets conversation read info. - last read count and last seen message id for a conversation
     *
     * @param conversationId the conversation id
     * @param userId         the user id
     * @return the conversation read info
     */
    public ConversationReadInfo getConversationReadInfo(Long conversationId, Long userId) {
        ConversationReadInfo conversationReadInfo = conversationReadStatusRepository
            .findConversationReadInfoByConversationIdAndUserId(conversationId, userId);
        return conversationReadInfo;
    }
}


