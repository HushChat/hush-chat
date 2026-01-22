package com.platform.software.platform.workspace.entity;

import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.Where;

import java.util.Set;

@Entity
@Setter
@Getter
@Where(clause = "deleted = false")
@Table(
    name = "workspace",
    schema = "platform",
    uniqueConstraints = @UniqueConstraint(columnNames = {"workspace_identifier"})
)
public class Workspace extends AuditModel {
    @Id
    @GeneratedValue(generator = "platform.workplace_generator")
    private Long id;

    @NotBlank
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotBlank
    @Column(name = "workspace_identifier")
    private String workspaceIdentifier;

    private String imageUrl;

    private boolean deleted = false;

    @Enumerated(EnumType.STRING)
    private WorkspaceStatus status = WorkspaceStatus.PENDING;
}
