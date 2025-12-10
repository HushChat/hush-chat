package com.platform.software.platform.workspace.controller;

import com.platform.software.chat.conversation.dto.ConversationAdminViewDTO;
import com.platform.software.chat.conversation.service.ConversationService;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.interceptors.WorkspaceAdminRestrictedAccess;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.platform.workspace.dto.WorkspaceUserSuspendDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserViewDTO;
import com.platform.software.platform.workspaceuser.service.WorkspaceUserService;
import io.swagger.annotations.ApiOperation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
}
