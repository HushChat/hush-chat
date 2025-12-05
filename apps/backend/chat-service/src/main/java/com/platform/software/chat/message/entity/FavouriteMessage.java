package com.platform.software.chat.message.entity;

import com.platform.software.chat.conversation.entity.Conversation;
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
@Table(uniqueConstraints = @UniqueConstraint(name = "uk_favourite_message_user_message", columnNames = {"user_id", "message_id"}))
public class FavouriteMessage extends AuditModel {
    @Id
    @GeneratedValue(generator = "favourite_message_generator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private ChatUser user;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Message message;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private Conversation conversation;
}
