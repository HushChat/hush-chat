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
