package com.platform.software.chat.conversation.service;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.dto.ConversationMetaDataDTO;
import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.repository.ConversationRepository;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import com.platform.software.chat.message.dto.BasicMessageDTO;
import com.platform.software.chat.message.dto.MessageForwardRequestDTO;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.repository.UserRepository;
import com.platform.software.common.model.MediaPathEnum;
import com.platform.software.config.aws.CloudPhotoHandlingService;
import com.platform.software.config.aws.SignedURLDTO;
import com.platform.software.config.cache.CacheNames;
import com.platform.software.exception.CustomBadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

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

    public ConversationUtilService(
        ConversationParticipantRepository conversationParticipantRepository,
        UserRepository userRepository,
        ConversationRepository conversationRepository,
        CloudPhotoHandlingService cloudPhotoHandlingService
    ) {
        this.conversationParticipantRepository = conversationParticipantRepository;
        this.userRepository = userRepository;
        this.conversationRepository = conversationRepository;
        this.cloudPhotoHandlingService = cloudPhotoHandlingService;
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
        if(conversationParticipant.getIsDeleted()){
            throw new CustomBadRequestException("Can,t find conversation with ID %s".formatted(conversationId));
        }
        Conversation conversation = getConversationOrThrow(conversationId);
        ConversationMetaDataDTO conversationMetaDataDTO = conversationRepository.findConversationMetaData(conversationId, userId);

        Message pinnedMessage = conversation.getPinnedMessage();
        if (pinnedMessage != null) {
            BasicMessageDTO pinnedMessageDTO = new BasicMessageDTO(pinnedMessage);
            conversationMetaDataDTO.setPinnedMessage(pinnedMessageDTO);
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
}