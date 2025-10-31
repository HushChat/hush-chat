package com.platform.software.platform.workspace.dto;

import com.platform.software.common.model.ModelMapper;
import com.platform.software.platform.workspace.entity.Workspace;
import lombok.Data;

@Data
public class WorkspaceDTO implements ModelMapper<Workspace> {
    private Long id;
    private String name;
    private String description;
    private String workspaceIdentifier;
    private String imageUrl;

    public WorkspaceDTO(Workspace workspace) {
        this.mapToSelf(workspace);
    }

    @Override
    public Workspace getModel() {
        return null;
    }

    @Override
    public Workspace mapToModel(Workspace dao) {
        dao.setId(this.getId());
        dao.setName(this.getName());
        dao.setDescription(this.getDescription());
        dao.setWorkspaceIdentifier(this.getWorkspaceIdentifier());
        dao.setImageUrl(this.getImageUrl());

        return dao;
    }

    @Override
    public void mapToSelf(Workspace dao) {
        this.setId(dao.getId());
        this.setName(dao.getName());
        this.setDescription(dao.getDescription());
        this.setWorkspaceIdentifier(dao.getWorkspaceIdentifier());
        this.setImageUrl(dao.getImageUrl());
    }
}
