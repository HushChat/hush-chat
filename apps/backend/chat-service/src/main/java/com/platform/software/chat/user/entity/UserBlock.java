package com.platform.software.chat.user.entity;

import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Setter
@Getter
@Table(uniqueConstraints = @UniqueConstraint(name = "uk_user_block_blocker_blocked", columnNames = {"blocker_id", "blocked_id"}))
public class UserBlock extends AuditModel {
    @Id
    @GeneratedValue(generator = "user_block_generator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocker_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ChatUser blocker;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "blocked_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ChatUser blocked;
}
