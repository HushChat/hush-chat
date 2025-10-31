package com.platform.software.chat.user.service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversation.repository.ConversationRepository;
import com.platform.software.chat.notification.repository.ChatNotificationRepository;
import com.platform.software.chat.user.dto.UserFilterCriteriaDTO;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.repository.UserQueryRepository;
import com.platform.software.common.dto.LoginDTO;
import com.platform.software.common.model.MediaPathEnum;
import com.platform.software.config.aws.AWSconfig;
import com.platform.software.config.cache.CacheNames;
import com.platform.software.config.cache.RedisCacheService;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomCognitoServerErrorException;
import com.platform.software.exception.CustomInternalServerErrorException;
import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspaceuser.service.WorkspaceUserService;
import com.platform.software.chat.user.entity.UserBlock;
import com.platform.software.chat.user.repository.UserBlockRepository;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.platform.software.chat.user.dto.UserDTO;
import com.platform.software.chat.user.dto.UserUpsertDTO;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.chat.user.repository.UserRepository;
import com.platform.software.common.service.security.CognitoService;
import com.platform.software.config.aws.CloudPhotoHandlingService;
import com.platform.software.config.aws.DocUploadRequestDTO;
import com.platform.software.config.aws.SignedURLDTO;
import com.platform.software.config.security.LoginResponseDTO;
import com.platform.software.utils.CommonUtils;
import com.platform.software.utils.ValidationUtils;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;
import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.services.cognitoidentityprovider.CognitoIdentityProviderClient;
import software.amazon.awssdk.services.cognitoidentityprovider.model.AttributeType;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GetUserRequest;
import software.amazon.awssdk.services.cognitoidentityprovider.model.GetUserResponse;

import static com.platform.software.common.constants.GeneralConstants.USER_NOT_CONFIRMED;

@Service
public class UserServiceImpl implements UserService {
    private final RedisCacheService cacheService;
    Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final UserRepository userRepository;
    private final CognitoService cognitoService;
    private final CloudPhotoHandlingService cloudPhotoHandlingService;
    private final WorkspaceUserService workspaceUserService;
    private final UserBlockRepository userBlockRepository;
    private final UserQueryRepository userQueryRepository;
    private final ConversationRepository conversationRepository;
    private final UserUtilService userUtilService;
    private final AWSconfig awSconfig;
    private final ChatNotificationRepository chatNotificationRepository;


    public UserServiceImpl(
            UserRepository userRepository,
            CognitoService cognitoService,
            CloudPhotoHandlingService cloudPhotoHandlingService,
            WorkspaceUserService workspaceUserService,
            UserBlockRepository userBlockRepository,
            RedisCacheService cacheService,
            UserQueryRepository userQueryRepository,
            ConversationRepository conversationRepository,
            UserUtilService userUtilService,
            AWSconfig awSconfig,
            ChatNotificationRepository chatNotificationRepository
    ) {
        this.userRepository = userRepository;
        this.cognitoService = cognitoService;
        this.cloudPhotoHandlingService = cloudPhotoHandlingService;
        this.workspaceUserService = workspaceUserService;
        this.userBlockRepository = userBlockRepository;
        this.cacheService = cacheService;
        this.userQueryRepository = userQueryRepository;
        this.conversationRepository = conversationRepository;
        this.userUtilService = userUtilService;
        this.chatNotificationRepository = chatNotificationRepository;
        this.awSconfig = awSconfig;
    }

    @Override
    public Page<UserDTO> getAllUsers(Pageable pageable, UserFilterCriteriaDTO userFilterCriteriaDTO, Long loggedInUserId) {
        Page<ChatUser> users = userQueryRepository.findAllUsersByCriteria(pageable, userFilterCriteriaDTO, loggedInUserId);
        return users.map(UserDTO::new);
    }

    @Override
    public ChatUser createUser(UserUpsertDTO userUpsertDTO) {
        ValidationUtils.validate(userUpsertDTO);

        Workspace workspace = workspaceUserService.getInvitedWorkspace(userUpsertDTO.getEmail());
        ChatUser createdUser = userUtilService.createUser(userUpsertDTO, workspace);
        workspaceUserService.markInvitationAsAccepted(userUpsertDTO.getEmail(), workspace.getId());

        return createdUser;
    }

    @Override
    public LoginResponseDTO authenticateUser(LoginDTO loginDTO) {
        
        ValidationUtils.validate(loginDTO);
        String email = loginDTO.getEmail().toLowerCase();

        getUserByEmail(email);

        try {
            LoginResponseDTO loginResponseDTO = cognitoService.authenticateUser(email, loginDTO.getPassword());

            List<Workspace> workspaces = workspaceUserService.getAllWorkspaces(email);
            loginResponseDTO.setWorkspaces(workspaces);
            return loginResponseDTO;
        } catch (AwsServiceException awsServiceException) {
            if(awsServiceException.awsErrorDetails().errorCode().equals(USER_NOT_CONFIRMED)){
                throw new CustomCognitoServerErrorException("Please confirm your account.");
            }
            throw new CustomCognitoServerErrorException(awsServiceException.awsErrorDetails().errorMessage());
        } catch (Exception exception) {
            throw new CustomCognitoServerErrorException("Login failed");
        }
    }

    @Override
    public ChatUser getUserOrThrow(Long userId) {
        ChatUser user = userRepository.findById(userId)
            .orElseThrow(() -> new CustomBadRequestException("Cannot find user with id %s".formatted(userId)));
        return user;
    }

    @Override
    public ChatUser getUserByEmail(String email) {
        Optional<ChatUser> userOptional = userRepository.findByEmail(email);
        if (userOptional.isEmpty() || !userOptional.get().getActive() || userOptional.get().getDeleted()) {
            logger.warn("invalid user provided {}", email);
            throw new CustomBadRequestException("Invalid email address. Please check and try again.");
        }
        return userOptional.get();
    }

    @Override
    public UserDTO getUserByIdWithProfileImage(Long id) {
        ChatUser user = userRepository.findById(id)
        .orElseThrow(() -> {
            logger.warn("invalid user id {} provided", id);
            return new CustomBadRequestException("user does not exist!");
        });
        
        UserDTO userDTO = new UserDTO(user);
        return userDTO;
    }


    @Cacheable(value = CacheNames.FIND_USER_BY_ID, keyGenerator = CacheNames.WORKSPACE_AWARE_KEY_GENERATOR)
    @Override
    public UserViewDTO findUserById(Long id) {
        ChatUser user = userRepository.findById(id)
        .orElseThrow(() -> {
            logger.warn("invalid user id {} provided", id);
            return new CustomBadRequestException("user does not exist!");
        });
        
        UserViewDTO userViewDTO = new UserViewDTO(user);
        userViewDTO.setSignedImageUrl(getUserProfileImageUrl(user.getImageIndexedName()));
        return userViewDTO;
    }

    @Override
    public void signOut(String accessToken) {
        CognitoIdentityProviderClient cognitoClient = awSconfig.cognitoClient();
        GetUserRequest getUserRequest = GetUserRequest.builder()
                .accessToken(accessToken)
                .build();

        GetUserResponse response = cognitoClient.getUser(getUserRequest);
        String email = response.userAttributes().stream()
                .filter(attr -> "email".equals(attr.name()))
                .findFirst()
                .map(AttributeType::value)
                .orElse(null);

        if(cognitoService.signOut(accessToken)){
            chatNotificationRepository.deleteChatNotificationsByChatUser_Email(email);
        }
    }

    @Override
    public ChatUser validateAndGetUser(Long userId) {
        return userRepository.findById(userId).orElseThrow(() -> {
            logger.warn("invalid user id provided as {}", userId);
            throw new CustomBadRequestException("Invalid user id provided!");
        });
    }

    @Override
    public ChatUser updateUser(UserDTO userDTO) {
        ChatUser user = validateAndGetUser(userDTO.getId());

        user.setFirstName(userDTO.getFirstName());
        user.setLastName(userDTO.getLastName());

        ChatUser updatedUser;
        try {
            updatedUser = userRepository.save(user);

            if(userDTO.getImageIndexedName() != null) {
                UserDTO updatedUserDTO = new  UserDTO(updatedUser);

                UserDTO userDTOWithSignedUrl = userUtilService.addSignedImageUrlToUser(updatedUserDTO, userDTO.getImageIndexedName());
                // save again with userID_imageFileName
                updatedUser.setImageIndexedName(userDTOWithSignedUrl.getImageIndexedName());
                updatedUser.setSignedImageUrl(userDTOWithSignedUrl.getSignedImageUrl());

                updatedUser = userRepository.save(updatedUser);
            }

            cacheService.evictByLastPartsForCurrentWorkspace(List.of(CacheNames.FIND_USER_BY_ID+":" + user.getId()));
            List<Conversation> conversations = conversationRepository.getOneToOneConversationsForCurrentUser(user.getId());
            for (Conversation conversation : conversations) {
                cacheService.evictByLastPartsForCurrentWorkspace(List.of(CacheNames.GET_CONVERSATION_META_DATA + ":" + conversation.getId()));
            }
        } catch (Exception exception) {
            logger.error("failed to update user id: {}", user.getId(), exception);
            throw new CustomInternalServerErrorException("Failed to update user");
        }
        return updatedUser;
    }

    @Override
    public SignedURLDTO generateSignedURLForProfilePictureUpload(DocUploadRequestDTO docUploadRequestDTO, Long id) {
        ChatUser user = validateAndGetUser(id);

        SignedURLDTO imageSignedDTO = cloudPhotoHandlingService.getPhotoUploadSignedURL(MediaPathEnum.PROFILE_PICTURE, docUploadRequestDTO.getFileNames().getFirst());

        if (imageSignedDTO != null && CommonUtils.isNotEmptyObj(imageSignedDTO.getIndexedFileName())) {
            user.setImageIndexedName(imageSignedDTO.getIndexedFileName());
        }

        try {
            userRepository.save(user);
        } catch (Exception exception) {
            logger.error("failed to update user id: {}", user.getId(), exception);
            throw new CustomInternalServerErrorException("Failed to update user");
        }
        return imageSignedDTO;
    }

    @Override
    public Long countUsersByIds(List<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return (long) 0;
        }
        return userRepository.countByIdIn(userIds);
    }

    private String getUserProfileImageUrl(String imageIndexedName) {
        if (imageIndexedName != null && !imageIndexedName.isEmpty()) {
            return cloudPhotoHandlingService.getPhotoViewSignedURL(imageIndexedName);
        }
        return imageIndexedName;
    }

    @Override
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED)
    public void createUserForNewWorkspace(String tenant, String loggedInUserEmail) {
        ChatUser newUser = new ChatUser();
        newUser.setEmail(loggedInUserEmail);
        newUser.setFirstName(loggedInUserEmail); // TODO:
        newUser.setLastName(loggedInUserEmail);
        newUser.setActive(true);
        userRepository.save(newUser);
    }

    public void blockUser(Long userId, Long blockId) {
        if (userBlockRepository.existsByBlockerIdAndBlockedId(userId, blockId)) {
            logger.warn("user {} has already blocked user {}", userId, blockId);
            throw new CustomBadRequestException("User is already blocked!");
        }
        if (userId.equals(blockId)) {
            logger.warn("user {} attempted to block themselves", userId);
            throw new CustomBadRequestException("Cannot block yourself!");
        }

        ChatUser blocker = getUserOrThrow(userId);
        ChatUser blocked = getUserOrThrow(blockId);
        UserBlock userBlock = new UserBlock();
        userBlock.setBlocker(blocker);
        userBlock.setBlocked(blocked);
        try {
            userBlockRepository.save(userBlock);
        } catch (Exception e) {
            logger.error("failed to block user {} by user {}", blockId, userId, e);
            throw new CustomInternalServerErrorException("Failed to block user!");
        }
    }

    @Override
    public Page<UserViewDTO> getBlockUsersByUserId(Pageable pageable, Long userId) {
        return userBlockRepository.getBlockedUsersById(pageable, userId);
    }

    @Override
    public boolean isInteractionBlockedBetween(Long userId1, Long userId2) {
        boolean isBlocked = userBlockRepository.existsByBlockerIdAndBlockedId(userId1, userId2) ||
                userBlockRepository.existsByBlockerIdAndBlockedId(userId2, userId1);
        return isBlocked;
    }

    @Override
    public void unblockUser(Long userId, Long blockId) {
        Optional<UserBlock> userBlockOptional = userBlockRepository
                .findByBlockerIdAndBlockedId(userId, blockId);

        if (userBlockOptional.isEmpty()) {
            logger.warn("no block relationship found where user {} blocked user {}", userId, blockId);
            throw new CustomBadRequestException("You have not blocked this user");
        }

        UserBlock userBlock = userBlockOptional.get();

        try {
            userBlockRepository.delete(userBlock);
            logger.info("user {} unblocked user {}", userId, blockId);
        } catch (Exception e) {
            logger.error("failed to unblock user {} by user {}", blockId, userId, e);
            throw new CustomInternalServerErrorException("Failed to unblock user");
        }
    }

    @Override
    public Page<UserDTO> getAllUsersWithConversations(Pageable pageable, UserFilterCriteriaDTO userFilterCriteriaDTO,
            Long loggedInUserId) {
        Page<ChatUser> userPage = userQueryRepository.findAllUsersByCriteria(
            pageable, userFilterCriteriaDTO, loggedInUserId
        );

        if (userPage.getContent().isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, userPage.getTotalElements());
        }

        List<Long> userIds = userPage.getContent().stream()
                .map(ChatUser::getId)
                .collect(Collectors.toList());

        Map<Long, Long> userToConversationMap = conversationRepository
                .findDirectConversationsBatch(loggedInUserId, userIds);

        List<UserDTO> userDTOs = userPage.getContent().stream()
                .map(user -> mapToUserDTOWithConversation(user, userToConversationMap))
                .collect(Collectors.toList());

        return new PageImpl<>(userDTOs, pageable, userPage.getTotalElements());
    }

    private UserDTO mapToUserDTOWithConversation(ChatUser user, Map<Long, Long> conversationMap) {
        UserDTO userDTO = new UserDTO();
        userDTO.setId(user.getId());
        userDTO.setUsername(user.getUsername());
        userDTO.setFirstName(user.getFirstName());
        userDTO.setLastName(user.getLastName());
        userDTO.setEmail(user.getEmail());
        userDTO.setActive(user.getActive());
        userDTO.setDeleted(user.getDeleted());
        userDTO.setImageIndexedName(user.getImageIndexedName());
        userDTO.setConversationId(conversationMap.get(user.getId()));

        return userDTO;
    }
}
