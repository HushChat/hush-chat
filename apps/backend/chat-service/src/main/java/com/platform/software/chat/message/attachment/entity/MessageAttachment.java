package com.platform.software.chat.message.attachment.entity;

import com.platform.software.chat.message.entity.Message;
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
public class MessageAttachment extends AuditModel {
    @Id
    @GeneratedValue(generator = "message_attachment_generator")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "message_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Message message;

    @NotNull
    private String originalFileName;

    @NotNull
    private String indexedFileName;

    @Enumerated(EnumType.STRING)
    private AttachmentTypeEnum type;
}