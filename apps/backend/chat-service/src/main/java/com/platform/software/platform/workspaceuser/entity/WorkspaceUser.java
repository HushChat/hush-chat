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

package com.platform.software.platform.workspaceuser.entity;

import com.platform.software.platform.workspace.entity.Workspace;
import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Where;

@Entity
@Setter
@Getter
@Where(clause = "deleted = false")
@Table(name = "workspace_user", schema = "platform")
public class WorkspaceUser extends AuditModel{
    @Id
    @GeneratedValue(generator = "platform.workspace_user_generator")
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String email;

    @NotNull
    @ManyToOne
    @JoinColumn(name = "workspace_id")
    private Workspace workspace;

    @NotNull
    @Enumerated(EnumType.STRING)
    private WorkspaceUserStatus status = WorkspaceUserStatus.PENDING;

    private boolean deleted = false;

    private String inviterEmail;
}
