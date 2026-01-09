package com.platform.software.chat.conversation.readstatus.entity;

import com.platform.software.chat.conversation.entity.Conversation;
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
@Table(uniqueConstraints =
    @UniqueConstraint(
            name = "UK_conversation_user_read_status",
            columnNames = {"conversation_id", "user_id"}
    ),
    indexes = {
            @Index(
                    name = "idx_crs_user_conversation",
                    columnList = "user_id, conversation_id"
            ),
            @Index(
                    name = "idx_crs_message",
                    columnList = "message_id"
            )
    })


public class ConversationReadStatus extends AuditModel {
    @Id
    @GeneratedValue(generator = "conversation_read_status_generator")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private ChatUser user;
}
