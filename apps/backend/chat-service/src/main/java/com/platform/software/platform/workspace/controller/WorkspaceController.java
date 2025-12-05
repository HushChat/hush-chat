package com.platform.software.platform.workspace.controller;

import com.platform.software.chat.user.dto.UserDTO;
import com.platform.software.chat.user.dto.WorkSpaceUserUpsertDTO;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.platform.workspace.dto.*;
import com.platform.software.platform.workspace.service.WorkspaceService;
import com.platform.software.platform.workspaceuser.service.WorkspaceUserService;
import io.swagger.annotations.ApiOperation;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/workspaces")
public class WorkspaceController {

    private final WorkspaceUserService workspaceUserService;
    private final UserService userService;
    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceUserService workspaceUserService, UserService userService, WorkspaceService workspaceService) {
        this.workspaceUserService = workspaceUserService;
        this.userService = userService;
        this.workspaceService = workspaceService;
    }

    @ApiOperation(value = "Create new workspace")
    @PostMapping
    public ResponseEntity<Void> createWorkspace(
            @Valid @RequestBody WorkspaceUpsertDTO workspaceUpsertDTO,
            @AuthenticatedUser UserDetails userDetails
    ){
        workspaceService.createWorkspace(workspaceUpsertDTO, userDetails.getEmail());
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @ApiOperation(value = "invite to workspaces")
    @PostMapping("/invite")
    public ResponseEntity<Void> inviteToWorkspace(
            @RequestHeader("X-Tenant") String workspaceIdentifier,
            @AuthenticatedUser UserDetails userDetails,
            @Valid @RequestBody WorkspaceUserInviteDTO workspaceUserInviteDTO
    ) {
        workspaceUserService.inviteUserToWorkspace(userDetails.getEmail(), workspaceIdentifier, workspaceUserInviteDTO);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @ApiOperation(value = "Create a new workspace user", response = UserDTO.class)
    @PostMapping("/register")
    public ResponseEntity<UserDTO> createWorkSpaceUser(
            @Valid @RequestBody WorkSpaceUserUpsertDTO workSpaceUserUpsertDTO,
            @AuthenticatedUser UserDetails userDetails
    ) {
        UserDTO createdEmployee = userService.createWorkSpaceUser(workSpaceUserUpsertDTO, userDetails.getEmail());
        return new ResponseEntity<>(createdEmployee, HttpStatus.CREATED);
    }

    @ApiOperation(value = "Get Active/Pending Workspaces by email")
    @GetMapping("/my-workspaces")
    public ResponseEntity<List<WorkspaceDTO>> getMyWorkspaces(@AuthenticatedUser UserDetails userDetails) {
        return new ResponseEntity<>(workspaceUserService.getAllWorkspaceDTO(userDetails.getEmail()), HttpStatus.OK);
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
            @AuthenticatedUser UserDetails userDetails,
            Pageable pageable
    ) {
        Page<WorkspaceUserViewDTO> workspaceUsers = userService.getAllWorkspaceUsersByEmail(userDetails.getEmail(), pageable);
        return new ResponseEntity<>(workspaceUsers, HttpStatus.OK);
    }
}
