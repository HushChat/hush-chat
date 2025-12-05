package com.platform.software.platform.workspace.dto;

import com.platform.software.platform.workspaceuser.entity.WorkspaceUserStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WorkspaceUserViewDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String imageIndexedName;
    private WorkspaceUserStatus status;
}
