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

package com.platform.software.platform.workspace.dto;

import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUser;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUserStatus;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkspaceUserInviteDTO {
    @NotBlank
    @Email(message = "Email should be valid")
    private String email;

    public static WorkspaceUser createPendingInvite(WorkspaceUserInviteDTO dto, Workspace workspace, String inviterEmail) {
        WorkspaceUser newWorkspaceUser = new WorkspaceUser();
        newWorkspaceUser.setEmail(dto.getEmail());
        newWorkspaceUser.setStatus(WorkspaceUserStatus.PENDING);
        newWorkspaceUser.setWorkspace(workspace);
        newWorkspaceUser.setInviterEmail(inviterEmail);
        return newWorkspaceUser;
    }
}
