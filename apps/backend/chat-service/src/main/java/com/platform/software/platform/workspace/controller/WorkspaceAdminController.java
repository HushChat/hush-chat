package com.platform.software.platform.workspace.controller;

import com.platform.software.chat.conversation.dto.ConversationAdminViewDTO;
import com.platform.software.chat.conversation.service.ConversationService;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.dto.UserDTO;
import com.platform.software.chat.user.dto.UserFilterCriteriaDTO;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.interceptors.WorkspaceAdminRestrictedAccess;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.platform.workspace.dto.WorkspaceUserInviteDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserSuspendDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserViewDTO;
import com.platform.software.platform.workspaceuser.service.WorkspaceUserService;
import io.swagger.annotations.ApiOperation;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@WorkspaceAdminRestrictedAccess
@RestController
@RequestMapping("/admin/workspace")
public class WorkspaceAdminController {

    private final ConversationService conversationService;
    private final WorkspaceUserService workspaceUserService;
    private final UserService userService;

    public WorkspaceAdminController(ConversationService conversationService, WorkspaceUserService workspaceUserService, UserService userService) {
        this.conversationService = conversationService;
        this.workspaceUserService = workspaceUserService;
        this.userService = userService;
    }

    @ApiOperation(value = "Get all group conversations in a workspace", response = ConversationAdminViewDTO.class)
    @GetMapping("/conversations")
    public ResponseEntity<Page<ConversationAdminViewDTO>> getAllGroupConversations( Pageable pageable )
    {
        return new ResponseEntity<>(conversationService.getAllGroupConversations(pageable), HttpStatus.OK);
    }

    @ApiOperation(value = "Delete conversation by id", response = ConversationAdminViewDTO.class)
    @DeleteMapping("/conversations/{conversationId}")
    public ResponseEntity<Void> deleteGroupConversation(
            @PathVariable Long conversationId
    ) {
        conversationService.deleteConversationById(conversationId);
        return new ResponseEntity<>(HttpStatus.NO_CONTENT);
    }

    @ApiOperation(value = "Suspend/Unsuspend workspace user")
    @PatchMapping("/suspend")
    public ResponseEntity<Void> toggleSuspendWorkspaceUser(
            @AuthenticatedUser UserDetails userDetails,
            @RequestBody WorkspaceUserSuspendDTO workspaceUserSuspendDTO
    ) {
        workspaceUserService.toggleSuspendWorkspaceUser(userDetails.getEmail(), WorkspaceContext.getCurrentWorkspace(), workspaceUserSuspendDTO);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @ApiOperation(value = "Get all workspace users", response = WorkspaceUserViewDTO.class)
    @GetMapping("/users")
    public ResponseEntity<Page<WorkspaceUserViewDTO>> getAllWorkspaceUsers(
            Pageable pageable
    ) {
        Page<WorkspaceUserViewDTO> workspaceUsers = userService.getAllWorkspaceUsers(pageable);
        return new ResponseEntity<>(workspaceUsers, HttpStatus.OK);
    }

    @ApiOperation(value = "Get chat user details by id", response = UserViewDTO.class)
    @GetMapping("/chat-users/{userId}")
    public ResponseEntity<UserViewDTO> getChatUserById(@PathVariable Long userId) {
        UserViewDTO user = userService.findUserById(userId, WorkspaceContext.getCurrentWorkspace());
        return new ResponseEntity<>(user, HttpStatus.OK);
    }

    @ApiOperation(value = "Update chat user by id", response = UserViewDTO.class)
    @PutMapping("/chat-users/{userId}")
    public ResponseEntity<UserViewDTO> updateChatUser(@PathVariable Long userId, @Valid @RequestBody UserDTO userDTO) {
        userDTO.setId(userId);
        ChatUser updatedUser = userService.updateUser(userDTO);
        return ResponseEntity.ok(new UserViewDTO(updatedUser));
    }

    @ApiOperation(value = "Get all chat users in workspace", response = UserDTO.class)
    @GetMapping("/chat-users")
    public ResponseEntity<Page<UserDTO>> getAllChatUsers(
            Pageable pageable,
            UserFilterCriteriaDTO userFilterCriteriaDTO,
            @AuthenticatedUser UserDetails authenticatedUser
    ) {
        Page<UserDTO> users = userService.getAllUsers(pageable, userFilterCriteriaDTO, authenticatedUser.getId());
        return new ResponseEntity<>(users, HttpStatus.OK);
    }

    @ApiOperation(value = "invite to workspaces")
    @PostMapping("/invite")
    public ResponseEntity<Void> inviteToWorkspace(
            @RequestHeader("X-Tenant") String workspaceIdentifier,
            @AuthenticatedUser UserDetails userDetails,
            @Valid @RequestBody List<WorkspaceUserInviteDTO> workspaceUserInviteDTOs
    ) {
        workspaceUserService.inviteUserToWorkspace(userDetails.getEmail(), workspaceIdentifier, workspaceUserInviteDTOs);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Updates the role of a user within the current workspace.
     * <p>
     * This endpoint allows the authenticated user to change the role of another user
     * (identified by their email) in the currently active workspace context. The actual
     * role-switching logic is delegated to {@code workspaceUserService.toggleUserRole}.
     * </p>
     *
     * @param userDetails The details of the currently authenticated user, extracted from the authentication context.
     * @param email       The email address of the user whose role should be toggled within the workspace.
     * @return A {@link ResponseEntity} with HTTP status {@code 204 No Content} if the operation succeeds.
     *
     * @throws org.springframework.security.access.AccessDeniedException if the current user is not authorized to perform this operation.
     */
    @ApiOperation(value = "Update user role in workspace")
    @PatchMapping("users/{email}/role")
    public ResponseEntity<Void> toggleUserRole(@AuthenticatedUser UserDetails userDetails, @PathVariable String email) {
        workspaceUserService.toggleUserRole(userDetails, WorkspaceContext.getCurrentWorkspace(), email);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
