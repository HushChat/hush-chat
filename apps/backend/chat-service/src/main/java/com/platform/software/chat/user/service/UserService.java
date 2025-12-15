package com.platform.software.chat.user.service;

import java.util.List;

import com.platform.software.chat.user.activitystatus.dto.UserStatusEnum;
import com.platform.software.chat.user.dto.*;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.dto.LoginDTO;
import com.platform.software.config.security.model.UserDetails;
import com.platform.software.platform.workspace.dto.WorkspaceUserViewDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.platform.software.config.aws.DocUploadRequestDTO;
import com.platform.software.config.aws.SignedURLDTO;
import com.platform.software.config.security.LoginResponseDTO;

public interface UserService {
    Page<UserDTO> getAllUsers(Pageable pageable, UserFilterCriteriaDTO userFilterCriteriaDTO, Long loggedInUserId);

    Page<UserDTO> getAllUsersWithConversations(Pageable pageable,  UserFilterCriteriaDTO userFilterCriteriaDTO, Long loggedInUserId);

    UserDTO createWorkSpaceUser(WorkSpaceUserUpsertDTO workSpaceUserUpsertDTO, String email);

    void createUser(UserUpsertDTO userUpsertDTO);
    
    LoginResponseDTO authenticateUser(LoginDTO loginDTO);

    ChatUser getUserOrThrow(Long userId);

    ChatUser getUserByEmail(String email);

    UserDTO getUserByIdWithProfileImage(Long id);

    UserViewDTO findUserById(Long id, String workspaceIdentifier);

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

    Page<WorkspaceUserViewDTO> getAllWorkspaceUsers(Pageable pageable);

    UserStatusEnum updateUserAvailability(UserDetails authenticatedUser);
}

