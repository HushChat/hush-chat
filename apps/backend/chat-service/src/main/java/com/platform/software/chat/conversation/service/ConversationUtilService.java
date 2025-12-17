package com.platform.software.chat.conversation.service;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.dto.ConversationMetaDataDTO;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.repository.ConversationRepository;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.chat.message.dto.BasicMessageDTO;
import com.platform.software.chat.message.dto.MessageForwardRequestDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.repository.UserRepository;
import com.platform.software.common.model.MediaPathEnum;
import com.platform.software.config.aws.CloudPhotoHandlingService;
import com.platform.software.config.aws.SignedURLDTO;
import com.platform.software.config.cache.CacheNames;
import com.platform.software.config.cache.RedisCacheService;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.utils.CommonUtils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZonedDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class ConversationUtilService {
    Logger logger = LoggerFactory.getLogger(ConversationUtilService.class);

    private final ConversationParticipantRepository conversationParticipantRepository;
    private final UserRepository userRepository;
    private final ConversationRepository conversationRepository;
    private final CloudPhotoHandlingService cloudPhotoHandlingService;
    private final ConversationService conversationService;
    private final RedisCacheService cacheService;

    public ConversationUtilService(
            ConversationParticipantRepository conversationParticipantRepository,
            UserRepository userRepository,
            ConversationRepository conversationRepository,
            CloudPhotoHandlingService cloudPhotoHandlingService,
            @Lazy ConversationService conversationService,
            RedisCacheService cacheService
    ) {
        this.conversationParticipantRepository = conversationParticipantRepository;
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
        this.cloudPhotoHandlingService = cloudPhotoHandlingService;
        this.conversationService = conversationService;
        this.cacheService = cacheService;
    }

    /**
     * Retrieves a conversation by its ID, throwing an exception if not found.
     *
     * @param conversationId the ID of the conversation to retrieve
     * @return the Conversation object if found
     * @throws CustomBadRequestException if the conversation is not found
     */
    public Conversation getConversationOrThrow(Long conversationId) {
        return conversationRepository.findById(conversationId)
            .orElseThrow(() -> new CustomBadRequestException("Conversation not found"));
    }

    /**
     * Retrieves a conversation participant by conversation ID and user ID, throwing an exception if not found.
     *
     * @param conversationId the ID of the conversation
     * @param userId the ID of the user
     * @return the ConversationParticipant object if found
     * @throws CustomBadRequestException if the participant is not found or does not have permission
     */
    public ConversationParticipant getConversationParticipantOrThrow(Long conversationId, Long userId) {
        return  conversationParticipantRepository
            .findByConversationIdAndUser_IdAndConversationDeletedFalse(conversationId, userId)
            .orElseThrow(() -> new CustomBadRequestException("Cannot find participant conversation with ID %s or dont have permission for this"
                .formatted(conversationId))
            );
    }

    /**
     * Retrieves a ConversationDTO for a logged-in user and conversation ID, throwing an exception if not found.
     *
     * @param loggedInUserId the ID of the logged-in user
     * @param conversationId the ID of the conversation
     * @return the ConversationDTO if found
     * @throws CustomBadRequestException if the conversation is not found or the user does not have permission
     */
    public ConversationDTO getConversationDTOOrThrow(Long loggedInUserId, Long conversationId) {
        return conversationParticipantRepository
            .findConversationByUserIdAndConversationId(loggedInUserId, conversationId)
            .orElseThrow(() ->
                new CustomBadRequestException("Cannot find participant conversation with ID %s or dont have permission for this"
                    .formatted(conversationId))
            );
    }

    /** Returns the conversation participant if the given user is an admin of the specified group conversation and the conversation is not deleted; otherwise, throws an exception.
     *
     * @param userId the ID of the user
     * @param conversationId the ID of the conversation
     * @return the ConversationParticipant if found
     * @throws CustomBadRequestException if the participant is not found or does not have the required role
     */
    public ConversationParticipant getLoggedInUserIfAdminAndValidConversation(Long userId, Long conversationId) {
        return conversationParticipantRepository
            .findByConversationIdAndUser_IdAndConversationDeletedFalseAndRoleAndConversation_IsGroup(
                conversationId, userId, ConversationParticipantRoleEnum.ADMIN, true
            )
            .orElseThrow(() ->
                new CustomBadRequestException("You don't have permission manage this conversation")
            );
    }

    /**
     * Verifies that the given user has access to every conversation in the message forward request.
     *
     * @param userId the ID of the logged-in user
     * @param messageForwardRequestDTO the DTO containing conversation IDs to forward messages to
     * @param conversation the current conversation
     * @return a list of ConversationDTOs that the user has access to
     * @throws CustomBadRequestException if the user is not a member of any of the conversations
     */
    public List<ConversationDTO> verifyLoggedInUserHasAccessToEveryConversation(
        Long userId,
        MessageForwardRequestDTO messageForwardRequestDTO,
        Conversation conversation
    ) {
        Set<Long> conversationIds = new HashSet<>(messageForwardRequestDTO.getConversationIds());
        conversationIds.add(conversation.getId());
        List<ConversationDTO> joinedConversations = conversationParticipantRepository
            .findAllConversationByUserIdAndConversationIds(userId, conversationIds);
        if (joinedConversations.size() != conversationIds.size()) {
            throw new CustomBadRequestException("You need to be a member of every conversation you are trying to forward");
        }

        return joinedConversations;
    }

    /**
     * returns a map of user id with ConversationParticipant info
     */
    public Map<Long, ConversationParticipant> getConversationParticipantMap(Long conversationId, Collection<Long> userIds) {
        Map<Long, ConversationParticipant> participantMap = conversationParticipantRepository
            .findAllByConversationIdAndUser_IdInAndConversationDeletedFalse(conversationId, userIds)
            .stream()
            .collect(Collectors.toMap(p -> p.getUser().getId(), Function.identity()));
        return participantMap;
    }

    /**
     * Validates that all users in the provided collection are active and not deleted.
     *
     * @param userIds the collection of user IDs to validate
     * @return a map of user IDs to ChatUser objects for valid users
     * @throws CustomBadRequestException if any user is inactive or deleted
     */
    public Map<Long, ChatUser> validateUsersTryingToAdd(Collection<Long> userIds) {
        Map<Long, ChatUser> participantUserMap = userRepository.findByIdInAndActiveTrueAndDeletedFalse(userIds)
            .stream()
            .collect(Collectors.toMap(ChatUser::getId, Function.identity()));

        if (userIds.size() != participantUserMap.size()) {
            // there are inactive users in join participants request
            throw new CustomBadRequestException("You are trying to join an invalid users");
        }
        return participantUserMap;
    }

    /**
     * Retrieves the metadata of a conversation for a given conversation ID and participant, utilizing caching for performance.
     *
     * @param conversationId the ID of the conversation
     * @param userId the participant requesting the metadata
     * @return a ConversationMetaDataDTO containing the conversation metadata
     * @throws CustomBadRequestException if the participant has deleted the conversation
     */
    @Cacheable(value = CacheNames.GET_CONVERSATION_META_DATA, keyGenerator = CacheNames.WORKSPACE_AWARE_KEY_GENERATOR)
    public ConversationMetaDataDTO getConversationMetaDataDTO(Long conversationId, Long userId) {
        ConversationParticipant conversationParticipant = getConversationParticipantOrThrow(conversationId, userId);
        Conversation conversation = getConversationOrThrow(conversationId);
        ConversationMetaDataDTO conversationMetaDataDTO = conversationRepository.findConversationMetaData(conversationId, userId);

        boolean isPinnedMessageExpired = false;

        Message pinnedMessage = conversation.getPinnedMessage();
        if (pinnedMessage != null) {
            boolean isVisible = CommonUtils.isMessageVisible(
                pinnedMessage.getCreatedAt(), 
                conversationParticipant.getLastDeletedTime()
            );
            
            if(isVisible) {
                BasicMessageDTO pinnedMessageDTO = new BasicMessageDTO(pinnedMessage);
                conversationMetaDataDTO.setPinnedMessage(pinnedMessageDTO);
            }

            if (conversation.getPinnedMessageUntil() != null) {
                isPinnedMessageExpired = conversation.getPinnedMessageUntil().isBefore(ZonedDateTime.now());
            }
        }

        if (isPinnedMessageExpired) {
            conversation.setPinnedMessage(null);
            conversation.setPinnedMessageUntil(null);

            try {
                conversationRepository.save(conversation);
            } catch (Exception error) {
                logger.error("save conversation: {} by user: {} with null pinned message failed", conversation.getId(), userId, error);
            }

            // todo cache do not clear, seem i do it inside, correct it
            cacheService.evictByPatternsForCurrentWorkspace(List.of(CacheNames.GET_CONVERSATION_META_DATA));
        }

        return conversationMetaDataDTO;
    }

    /**
     * Retrieves the metadata of a conversation for a specific user, updated image index and signed url
     *
     * @param conversationDTO the conversation
     * @param fileName the name of the image eg:- imageName
     * @return a conversationDTO containing the conversation's metadata and updated image index and signed url
     */
    public ConversationDTO addSignedImageUrlToConversationDTO(ConversationDTO conversationDTO,String fileName) {
        String newFileName = (conversationDTO.getId()) + "_" + fileName;
        String imageIndexName = String.format("chat-service/conversation/%s", newFileName);
        conversationDTO.setImageIndexedName(imageIndexName);

        SignedURLDTO imageSignedDTO = cloudPhotoHandlingService.getPhotoUploadSignedURL(MediaPathEnum.GROUP_PICTURE, newFileName);
        conversationDTO.setSignedImageUrl(imageSignedDTO.getUrl());

        return conversationDTO;
    }

    public String getImageViewSignedUrl(String imageIndexedName) {
        if (imageIndexedName != null && !imageIndexedName.isEmpty()) {
            return cloudPhotoHandlingService.getPhotoViewSignedURL(imageIndexedName);
        }
        return imageIndexedName;
    }

    /**
     * Checks if a conversation is currently muted based on the muted-until timestamp.
     * <p>
     * A conversation is considered muted if:
     * <ul>
     *   <li>mutedUntil is not null, AND</li>
     *   <li>The current time is before the mutedUntil timestamp</li>
     * </ul>
     * <p>
     * The comparison is performed at second precision to avoid millisecond-level edge cases.
     * If mutedUntil is null, the conversation is not muted.
     * If mutedUntil is in the past, the mute has expired and returns false.
     *
     * @param mutedUntil the timestamp until which the conversation is muted, or null if not muted
     * @return true if currently muted, false otherwise
     */
    public static boolean isMuted(ZonedDateTime mutedUntil) {
        if (mutedUntil == null) {
            return false;
        }

        ZonedDateTime now = ZonedDateTime.now().truncatedTo(ChronoUnit.SECONDS);
        ZonedDateTime mutedUntilTruncated = mutedUntil.truncatedTo(ChronoUnit.SECONDS);

        return now.isBefore(mutedUntilTruncated);
    }

    /**
     * Retrieves the conversation IDs associated with the given set of user IDs.
     * <p>
     * If a conversation involving the specified users (including the logged-in user)
     * does not already exist, this method will create a new conversation and return
     * the corresponding conversation ID(s).
     * </p>
     *
     * @param userIds         a set of user IDs to check or create a conversation for
     * @param loggedInUserId  the ID of the currently logged-in user who initiates or joins the conversation
     * @return a set containing the conversation IDs found or newly created
     */
    @Transactional
    public Set<Long> getOrCreateConversationIds(Set<Long> userIds, Long loggedInUserId) {

        //get existing conversation ids by user ids map
        Map<Long, Long> existingConversationMap = conversationParticipantRepository
            .findConversationIdsByUserIds(userIds, loggedInUserId);

        //get conversation ids by user ids if exist
        Set<Long> conversationIds = new HashSet<>(existingConversationMap.values());

        //get userid s of not existing conversations
        Set<Long> userIdsToCreateConversations = findUserIdsWithoutConversation(userIds, existingConversationMap.keySet());

        //create conversations for those user ids including logged in user id and return conversation ids
        for (Long userId : userIdsToCreateConversations) {
            ConversationDTO newConversation = conversationService.saveConversationAndBuildDTO(
                    conversationService.createConversation(loggedInUserId ,List.of(userId, loggedInUserId), false)
            );
            conversationIds.add(newConversation.getId());
        }

        return conversationIds;
    }

    private Set<Long> findUserIdsWithoutConversation(Set<Long> userIds, Set<Long> existing) {

        Set<Long> notExisting = new HashSet<>(userIds);
        notExisting.removeAll(existing);

        return notExisting;
    }

    /**
     * Retrieves all participants of a conversation except the sender.
     * <p>
     * This method fetches all users associated with the specified conversation ID
     * and filters out the user with the given sender ID, effectively returning
     * only the other participants in the conversation.
     * </p>
     *
     * @param conversationId  the ID of the conversation
     * @param senderId        the ID of the user to be excluded from the result
     * @return a list of ChatUser objects representing all participants
     *         in the conversation except the sender
     */
    public List<ChatUser> getAllParticipantsExceptSender(Long conversationId, Long sernderId) {
        Page<ConversationParticipant> participants = conversationParticipantRepository
                    .findByConversationId(conversationId, Pageable.unpaged());

        return participants.stream().map(participant -> participant.getUser())
                    .filter(user -> !user.getId().equals(sernderId)).toList();
    }

    /**
     * Deletes a conversation.
     *
     * @param conversation the Conversation entity to be deleted
     * @return the deleted Conversation entity
     */
    public Conversation deleteConversation(Conversation conversation) {
        conversation.setDeleted(true);
        try {
            return conversationRepository.save(conversation);
        } catch (Exception exception) {
            logger.error("failed to delete conversation id: {}", conversation.getId(), exception);
            throw new CustomBadRequestException("Failed to delete conversation");
        }
    }

    /**
     * Enriches message attachments with signed URLs for file access.
     *
     * @param attachments the list of message attachments to process, may be null or empty
     * @return a list of enriched attachment DTOs with signed URLs, or an empty list if input is null/empty
     */
    public List<MessageAttachmentDTO> getEnrichedMessageAttachmentsDTO(List<MessageAttachment> attachments) {
        if (attachments == null || attachments.isEmpty()) {
            return Collections.emptyList();
        }
        List<MessageAttachmentDTO> attachmentDTOs = new ArrayList<>();

        for (MessageAttachment attachment : attachments) {
            MessageAttachmentDTO dto = new MessageAttachmentDTO();
            try {
                String fileViewSignedURL = cloudPhotoHandlingService
                        .getPhotoViewSignedURL(attachment.getIndexedFileName());

                dto.setId(attachment.getId());
                dto.setFileUrl(fileViewSignedURL);
                dto.setIndexedFileName(attachment.getIndexedFileName());
                dto.setOriginalFileName(attachment.getOriginalFileName());
                dto.setType(attachment.getType());

                attachmentDTOs.add(dto);
            } catch (Exception e) {
                logger.error("Failed to process attachment {}: {}", attachment.getOriginalFileName(), e.getMessage());
                dto.setFileUrl(null);
            }
        }

        return attachmentDTOs;
    }
}