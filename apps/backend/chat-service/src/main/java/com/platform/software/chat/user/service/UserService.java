package com.platform.software.chat.user.service;

import com.platform.software.chat.user.dto.UserDTO;
import com.platform.software.chat.user.dto.UserFilterCriteriaDTO;
import com.platform.software.chat.user.dto.UserUpsertDTO;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.dto.LoginDTO;
import com.platform.software.config.aws.DocUploadRequestDTO;
import com.platform.software.config.aws.SignedURLDTO;
import com.platform.software.config.security.LoginResponseDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    Page<UserDTO> getAllUsers(Pageable pageable, UserFilterCriteriaDTO userFilterCriteriaDTO, Long loggedInUserId);

    Page<UserDTO> getAllUsersWithConversations(Pageable pageable, UserFilterCriteriaDTO userFilterCriteriaDTO, Long loggedInUserId);

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

