package com.platform.software.chat.user.service;

import com.platform.software.chat.user.dto.UserResetPasswordDTO;
import com.platform.software.chat.user.entity.AccountAdminSecurityAction;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.repository.UserRepository;
import com.platform.software.common.constants.WebSocketTopicConstants;
import com.platform.software.common.service.security.CognitoService;
import com.platform.software.common.service.security.PasswordResetDTO;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.exception.CustomInternalServerErrorException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class SecurityActionService {

    private final CognitoService cognitoService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final WebSocketSessionManager webSocketSessionManager;

    @Transactional
    public void changePassword(String loggedInUserEmail, UserResetPasswordDTO userResetPasswordDTO) {
        ChatUser user = updateUserWithSecurityAction(loggedInUserEmail);

        cognitoService.changePassword(
            userResetPasswordDTO.getAccessToken(),
            userResetPasswordDTO.getOldPassword(),
            userResetPasswordDTO.getNewPassword()
        );

        cognitoService.signOutUser(user.getEmail());

        dispatchForceLogout(user.getEmail(), WorkspaceContext.getCurrentWorkspace());
    }

    private ChatUser updateUserWithSecurityAction(String loggedInUserEmail) {
        ChatUser user = userService.getUserByEmail(loggedInUserEmail);

        user.setSecurityAction(AccountAdminSecurityAction.PASSWORD_CHANGED);
        try {
            userRepository.save(user);
        } catch (Exception e) {
            log.error("failed to change user password by user {}", loggedInUserEmail, e);
            throw new CustomInternalServerErrorException("Failed to change the password!");
        }
        return user;
    }

    public void confirmForgotPassword(PasswordResetDTO passwordResetDTO) {
        ChatUser user = updateUserWithSecurityAction(passwordResetDTO.getEmail());
        cognitoService.confirmForgotPassword(passwordResetDTO);
        cognitoService.signOutUser(user.getEmail());
    }

    private void dispatchForceLogout(String email, String workspaceId) {
        webSocketSessionManager.sendMessageToUser(
            workspaceId,
            email,
            WebSocketTopicConstants.FORCE_LOGOUT_INVOKE,
            "force logout user"
        );
    }
}
