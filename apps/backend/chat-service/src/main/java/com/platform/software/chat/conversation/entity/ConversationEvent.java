package com.platform.software.chat.conversation.entity;

import com.platform.software.chat.conversation.dto.ConversationEventType;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Entity
@Setter
@Getter
@Table(
        indexes = {
                @Index(
                        name = "idx_ce_actor",
                        columnList = "actor_user_id"
                ),
                @Index(
                        name = "idx_ce_target",
                        columnList = "target_user_id"
                ),
                @Index(
                        name = "idx_ce_message",
                        columnList = "message_id"
                )
        }
)
public class ConversationEvent extends AuditModel {
    @Id
    @GeneratedValue(generator = "conversation_event_generator")
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(name = "message_id")
    private Message message;

    @Enumerated(EnumType.STRING)
    private ConversationEventType eventType;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    private ChatUser actorUser;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "target_user_id")
    private ChatUser targetUser;

    @Column(columnDefinition = "TEXT")
    private String metadata;
}
