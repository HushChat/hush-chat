package com.platform.software.platform.workspace.dto;

import com.platform.software.platform.workspace.entity.Workspace;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class WorkspaceUpsertDTO {

    @NotBlank
    private String name;
    private String description;
    private String imageUrl;

    public Workspace buildWorkspace() {
        Workspace workspace = new Workspace();
        workspace.setName(this.name);
        workspace.setWorkspaceIdentifier(this.name);
        workspace.setDescription(this.description);
        workspace.setImageUrl(this.imageUrl);

        return workspace;
    }
}
