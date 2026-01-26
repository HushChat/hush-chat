package com.platform.software.platform.workspace.controller;

import com.platform.software.chat.conversation.dto.ConversationAdminViewDTO;
import com.platform.software.chat.conversation.service.ConversationService;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.interceptors.WorkspaceAdminRestrictedAccess;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.platform.workspace.dto.WorkspaceAllowedIpUpsertDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserInviteDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserSuspendDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserViewDTO;
import com.platform.software.platform.workspace.service.WorkspaceService;
import com.platform.software.platform.workspaceuser.service.WorkspaceUserService;
import io.swagger.annotations.ApiOperation;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
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
    private final WorkspaceService workspaceService;

    public WorkspaceAdminController(ConversationService conversationService, WorkspaceUserService workspaceUserService, UserService userService, WorkspaceService workspaceService) {
        this.conversationService = conversationService;
        this.workspaceUserService = workspaceUserService;
        this.userService = userService;
        this.workspaceService = workspaceService;
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


    /**
     * Adds allowed IP addresses to the current workspace.
     * <p>
     * This endpoint accepts a {@link WorkspaceAllowedIpUpsertDTO} containing the IP addresses
     * to be added to the allowed list for the current workspace. The addition of IPs is handled
     * by the {@code workspaceService.addAllowedIps} method.
     * </p>
     *
     * @param workspaceAllowedIpUpsertDTO The DTO containing the IP addresses to be added.
     * @return A {@link ResponseEntity} with HTTP status {@code 201 Created} if the IPs are successfully added.
     *
     * @throws org.springframework.security.access.AccessDeniedException if the current user is not authorized to perform this operation.
     */
    @ApiOperation(value = "Add allowed IPs to workspace")
    @PostMapping("/allowed-ips")
    public ResponseEntity<Void> addAllowedIps(
            @Valid @RequestBody WorkspaceAllowedIpUpsertDTO workspaceAllowedIpUpsertDTO
    ){
        workspaceService.addAllowedIps(WorkspaceContext.getCurrentWorkspace(), workspaceAllowedIpUpsertDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
