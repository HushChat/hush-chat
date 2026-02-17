package com.platform.software.chat.call.entity;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;

@Entity
@Table(name = "call_log")
@Setter
@Getter
public class CallLog extends AuditModel {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "call_log_generator")
    @SequenceGenerator(name = "call_log_generator", sequenceName = "call_log_generator", allocationSize = 50)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "initiator_id", nullable = false)
    private ChatUser initiator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    private Boolean isVideo = false;

    private ZonedDateTime callStartedAt;

    private ZonedDateTime callEndedAt;

    @NotNull
    @Enumerated(EnumType.STRING)
    private CallStatusEnum status;
}
