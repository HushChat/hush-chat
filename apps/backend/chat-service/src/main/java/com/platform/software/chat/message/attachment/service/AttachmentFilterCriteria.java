package com.platform.software.chat.message.attachment.service;

import com.platform.software.chat.message.attachment.entity.AttachmentFilterTypeEnum;
import lombok.Data;

@Data
public class AttachmentFilterCriteria {
    private Long conversationId;
    private AttachmentFilterTypeEnum type;
}
