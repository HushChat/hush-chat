package com.platform.software.platform.workspace.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
@Table(
        name = "workspace_allowed_ips",
        schema = "platform",
        uniqueConstraints = @UniqueConstraint(columnNames = {"workspace_id", "ipAddress"})
)
public class AllowedIp {
    @Id
    @GeneratedValue(generator = "platform.workspace_allowed_ip_generator")
    private Long id;

    @Column(nullable = false)
    private String ipAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workspace_id", nullable = false)
    private Workspace workspace;
}
