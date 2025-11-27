package com.platform.software.chat.message.entity;

import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Setter
@Getter
public class MessageHistory extends AuditModel {

    @Id
    @GeneratedValue(generator = "message_history_generator")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "message_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Message message;

    @Column(columnDefinition = "TEXT")
    private String messageText;
}
