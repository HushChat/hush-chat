package com.platform.software.chat.message.entity;

import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Setter
@Getter
public class MessageMention extends AuditModel {

    @Id
    @GeneratedValue(generator = "message_mention_generator")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "message_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Message message;

    @ManyToOne
    @JoinColumn(name = "mentioned_user_id", nullable = false)
    private ChatUser mentionedUser;
}
