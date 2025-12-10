package com.platform.software.chat.message.dto;

import com.platform.software.config.aws.DocUploadRequestDTO;
import lombok.Data;

import java.util.List;

@Data
public class MessageWithAttachmentUpsertDTO {
    private String messageText;
    private String fileName;
    private Long parentMessageId;

    public MessageUpsertDTO getMessageUpsertDTO() {
        MessageUpsertDTO messageUpsertDTO = new MessageUpsertDTO();
        messageUpsertDTO.setMessageText(messageText);
        messageUpsertDTO.setParentMessageId(parentMessageId);

        return messageUpsertDTO;
    }

    public DocUploadRequestDTO getFileName() {
        DocUploadRequestDTO uploadRequestDTO = new DocUploadRequestDTO();
        uploadRequestDTO.setFileNames(List.of(fileName));
        uploadRequestDTO.setIsGroup(false);

        return uploadRequestDTO;
    }
}
