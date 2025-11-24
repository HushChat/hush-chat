package com.platform.software.chat.call.entity;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.ZonedDateTime;
import java.util.UUID;

@Entity
@Setter
@Getter
public class CallLog extends AuditModel {

    @Id
    @GeneratedValue(generator = "call_log_generator")
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

    @Column(name = "session_uuid", nullable = false, unique = true)
    private UUID sessionUuid = UUID.randomUUID();

}
