package com.platform.software.chat.user.dto;

import com.platform.software.chat.user.activitystatus.dto.UserStatusEnum;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.platform.workspaceuser.entity.WorkspaceUserRole;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserViewDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String imageIndexedName;
    private String signedImageUrl;
    private String workspaceName;
    private WorkspaceUserRole workspaceRole;
    private UserStatusEnum status;

    public UserViewDTO(ChatUser user) {
        this.setId(user.getId());
        this.setFirstName(user.getFirstName());
        this.setLastName(user.getLastName());
        this.setEmail(user.getEmail());
        this.setUsername(user.getUsername());
        this.setImageIndexedName(user.getImageIndexedName());
        this.setSignedImageUrl(user.getSignedImageUrl());
        this.setStatus(user.getAvailabilityStatus());
    }

    public String getWorkspaceName() {
        return workspaceName;
    }

    public void setWorkspaceName(String workspaceName) {
        this.workspaceName = workspaceName;
    }

    public UserViewDTO(Long id, String firstName, String lastName, String signedImageUrl) {
        this.setId(id);
        this.setFirstName(firstName);
        this.setLastName(lastName);
        this.setSignedImageUrl(signedImageUrl);
    }
}
