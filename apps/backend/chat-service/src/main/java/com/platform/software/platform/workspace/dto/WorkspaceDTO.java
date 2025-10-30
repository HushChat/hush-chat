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
