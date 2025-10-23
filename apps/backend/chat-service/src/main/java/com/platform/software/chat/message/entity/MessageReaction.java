package com.platform.software.chat.message.entity;

import com.platform.software.chat.user.entity.ChatUser;
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
@Table(
    name = "message_reaction",
    uniqueConstraints = @UniqueConstraint(name = "uk_reaction_message_user_type", columnNames = {"message_id", "user_id"})
)
public class MessageReaction extends AuditModel {

    @Id
    @GeneratedValue(generator = "message_reaction_generator")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private ChatUser user;

    @NotNull
    @Enumerated(EnumType.STRING)
    private ReactionTypeEnum reactionType;
}
