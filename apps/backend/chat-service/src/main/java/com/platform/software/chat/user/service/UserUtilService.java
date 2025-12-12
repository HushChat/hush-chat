package com.platform.software.chat.user.service;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.chat.user.dto.UserUpsertDTO;
import com.platform.software.chat.user.dto.UserDTO;
import com.platform.software.chat.user.dto.WorkSpaceUserUpsertDTO;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.repository.UserRepository;
import com.platform.software.common.model.UserTypeEnum;
import com.platform.software.common.service.security.CognitoService;
import com.platform.software.exception.CustomBadRequestException;
import com.platform.software.exception.CustomCognitoServerErrorException;
import com.platform.software.exception.CustomInternalServerErrorException;
import com.platform.software.platform.workspace.entity.Workspace;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.platform.software.common.model.MediaPathEnum;
import com.platform.software.config.aws.CloudPhotoHandlingService;
import com.platform.software.config.aws.SignedURLDTO;

@Service
public class UserUtilService {
    Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);

    private final CognitoService cognitoService;
    private final UserRepository userRepository;
    private final CloudPhotoHandlingService cloudPhotoHandlingService;

    public UserUtilService(CognitoService cognitoService, UserRepository userRepository, CloudPhotoHandlingService cloudPhotoHandlingService) {
        this.cognitoService = cognitoService;
        this.userRepository = userRepository;
        this.cloudPhotoHandlingService = cloudPhotoHandlingService;
    }

    @Transactional
    public ChatUser createUser(WorkSpaceUserUpsertDTO workSpaceUserUpsertDTO) {
        checkIfUserAlreadyExists(workSpaceUserUpsertDTO.getEmail().toLowerCase());
        ChatUser user = workSpaceUserUpsertDTO.toChatUser();
        user.setActive(true);

        return persistUser(user);
    }

    public void createUserInIdP(String email, String password, String tenant) {
        var response = cognitoService.createUser(email, password, tenant, UserTypeEnum.CHAT_USER);
        if (!response.sdkHttpResponse().isSuccessful()) {
            logger.error("Failed to create user in IDP: {}", email);
            throw new CustomCognitoServerErrorException("IDP user creation failed");
        }
    }

    private void checkIfUserAlreadyExists(String email) {
        if (userRepository.findByEmail(email).isPresent()) {
            throw new CustomBadRequestException("User already exists");
        }
    }

    private ChatUser persistUser(ChatUser user) {
        try {
            return userRepository.save(user);
        } catch (Exception e) {
            logger.error("DB save failed for user {}", user.getEmail(), e);
            throw new CustomInternalServerErrorException("Failed to persist user");
        }
    }
  
    public UserDTO addSignedImageUrlToUser(UserDTO userDTO, String finalName) {
          String newFileName = (userDTO.getId() + "_" + finalName);

          userDTO.setImageIndexedName(newFileName);

          SignedURLDTO imageSignedDTO = cloudPhotoHandlingService.getPhotoUploadSignedURL(MediaPathEnum.PROFILE_PICTURE, newFileName);
          userDTO.setSignedImageUrl(imageSignedDTO.getUrl());

          return userDTO;
    }

    /**
     * set conversation name, only if 1-to-1 conversation
     *
     * @param includeSender true - To set name as the sender's name,
     *                      false - To set name as the OTHER participant's name
     */
    public static void setConversationNameForNonGroup(Long userId, ConversationDTO conversationDTO, boolean includeSender) {
        if(userId != null && !conversationDTO.getIsGroup()) {
            conversationDTO.getParticipants().stream()
                .filter(participant -> includeSender == participant.getUser().getId().equals(userId))
                .findFirst()
                .ifPresent(participant -> {
                    conversationDTO.setName("%s %s".formatted(
                        participant.getUser().getFirstName(),
                        participant.getUser().getLastName()
                    ));
                });
        }
    }
}
