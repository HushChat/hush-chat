package com.platform.software.chat.message.attachment.service;

import lombok.Data;

@Data
public class AttachmentFilterCriteria {
    private Long conversationId;
    private String type;
}
