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

import java.util.List;

import com.platform.software.chat.user.dto.UserFilterCriteriaDTO;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.dto.LoginDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.platform.software.chat.user.dto.UserDTO;
import com.platform.software.chat.user.dto.UserUpsertDTO;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.config.aws.DocUploadRequestDTO;
import com.platform.software.config.aws.SignedURLDTO;
import com.platform.software.config.security.LoginResponseDTO;

public interface UserService {
    Page<UserDTO> getAllUsers(Pageable pageable, UserFilterCriteriaDTO userFilterCriteriaDTO, Long loggedInUserId);

    Page<UserDTO> getAllUsersWithConversations(Pageable pageable,  UserFilterCriteriaDTO userFilterCriteriaDTO, Long loggedInUserId);
   
    ChatUser createUser(UserUpsertDTO userUpsertDTO);
    
    LoginResponseDTO authenticateUser(LoginDTO loginDTO);

    ChatUser getUserOrThrow(Long userId);

    ChatUser getUserByEmail(String email);

    UserDTO getUserByIdWithProfileImage(Long id);

    UserViewDTO findUserById(Long id);

    void signOut(String accessToken);

    ChatUser updateUser(UserDTO userDTO);

    ChatUser validateAndGetUser(Long userId);

    SignedURLDTO generateSignedURLForProfilePictureUpload(DocUploadRequestDTO docUploadRequestDTO, Long id);

    Long countUsersByIds(List<Long> userIds);

    void createUserForNewWorkspace(String tenant, String email);

    void blockUser(Long userId, Long blockId);

    Page<UserViewDTO> getBlockUsersByUserId(Pageable pageable, Long userId);

    boolean isInteractionBlockedBetween(Long userId1, Long userId2);

    void unblockUser(Long userId, Long blockId);

}

