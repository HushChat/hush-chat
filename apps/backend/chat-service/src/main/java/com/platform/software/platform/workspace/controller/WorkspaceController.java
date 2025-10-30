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

package com.platform.software.platform.workspace.controller;

import com.platform.software.config.security.AuthenticatedUser;
import com.platform.software.config.security.model.UserDetails;
import com.platform.software.platform.workspace.dto.WorkspaceDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUpsertDTO;
import com.platform.software.platform.workspace.dto.WorkspaceUserInviteDTO;
import com.platform.software.platform.workspace.service.WorkspaceService;
import com.platform.software.platform.workspaceuser.service.WorkspaceUserService;
import io.swagger.annotations.ApiOperation;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/workspaces")
public class WorkspaceController {

    private final WorkspaceUserService workspaceUserService;
    private final WorkspaceService workspaceService;

    public WorkspaceController(WorkspaceUserService workspaceUserService, WorkspaceService workspaceService) {
        this.workspaceUserService = workspaceUserService;
        this.workspaceService = workspaceService;
    }

    @ApiOperation(value = "switch workspaces", response = WorkspaceDTO.class)
    @PostMapping("{workspaceId}/switch")
    public ResponseEntity<WorkspaceDTO> switchWorkspaces(
        @PathVariable Long workspaceId,
        @AuthenticatedUser UserDetails userDetails
    ) {
        WorkspaceDTO workspace = workspaceUserService.verifyUserAccessToWorkspace(userDetails.getEmail(), workspaceId);
        return new ResponseEntity<>(workspace, HttpStatus.OK);
    }

    @ApiOperation(value = "create workspaces")
    @PostMapping
    public ResponseEntity<Void> createWorkspace(
        @RequestBody WorkspaceUpsertDTO workspaceUpsertDTO,
        @AuthenticatedUser UserDetails userDetails
    ) {
        workspaceService.createWorkspace(workspaceUpsertDTO, userDetails.getEmail());
        return new ResponseEntity<>(HttpStatus.OK);
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
}
