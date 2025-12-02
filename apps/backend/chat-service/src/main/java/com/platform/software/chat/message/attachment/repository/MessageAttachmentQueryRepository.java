package com.platform.software.chat.message.attachment.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.attachment.service.AttachmentFilterCriteria;

public interface MessageAttachmentQueryRepository {
    Page<MessageAttachmentDTO> filterAttachments(AttachmentFilterCriteria filterCriteria, Pageable pageable);
}
