package com.platform.software.chat.message.dto;

import com.platform.software.config.aws.DocUploadRequestDTO;
import lombok.Data;

@Data
public class MessageUpsertDTO {
    private String messageText;
    private DocUploadRequestDTO files;
    private Long parentMessageId;
}