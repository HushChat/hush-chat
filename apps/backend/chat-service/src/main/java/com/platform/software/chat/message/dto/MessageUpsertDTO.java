package com.platform.software.chat.message.dto;

import com.platform.software.config.aws.DocUploadRequestDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageUpsertDTO {
    private String messageText;
    private DocUploadRequestDTO files;
    private Long parentMessageId;
    private String gifUrl;
    private MessageTypeEnum messageType;

    public MessageUpsertDTO(String messageText) {
        this.messageText = messageText;
    }
}