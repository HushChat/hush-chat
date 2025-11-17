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
@Table(
        name = "workspace_user",
        uniqueConstraints = {
            @UniqueConstraint(columnNames = {"email", "workspace_id"})
        }
)
public class WorkspaceUser extends AuditModel{
    @Id
    @GeneratedValue(generator = "platform.workspace_user_generator")
    private Long id;

    @NotBlank
    @Column(nullable = false)
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
