/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package com.platform.software.chat.user.service;

import com.platform.software.chat.user.dto.UserUpsertDTO;
import com.platform.software.chat.user.dto.UserDTO;
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
    public ChatUser createUser(UserUpsertDTO userUpsertDTO, Workspace workspace) {
        checkIfUserAlreadyExists(userUpsertDTO.getEmail().toLowerCase());
        ChatUser user = userUpsertDTO.toChatUser();
        user.setActive(true);

        ChatUser savedUser = persistUser(user);
        createUserInIdP(user.getEmail().toLowerCase(), userUpsertDTO.getPassword(), workspace.getName());

        return savedUser;
    }

    private void createUserInIdP(String email, String password, String tenant) {
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
          String imageIndexName = String.format(MediaPathEnum.PROFILE_PICTURE.getName(), newFileName);

          userDTO.setImageIndexedName(imageIndexName);

          SignedURLDTO imageSignedDTO = cloudPhotoHandlingService.getPhotoUploadSignedURL(MediaPathEnum.PROFILE_PICTURE, newFileName);
          userDTO.setSignedImageUrl(imageSignedDTO.getUrl());

          return userDTO;
    }
}
