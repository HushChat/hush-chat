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
