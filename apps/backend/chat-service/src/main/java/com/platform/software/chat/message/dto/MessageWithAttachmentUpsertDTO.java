package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.attachment.entity.AttachmentTypeEnum;
import com.platform.software.config.aws.DocUploadRequestDTO;
import lombok.Data;

import java.util.List;

@Data
public class MessageWithAttachmentUpsertDTO {
    private String messageText;
    private String fileName;
    private Long parentMessageId;
    private String gifUrl;
    private String indexedFileName;
    private AttachmentTypeEnum attachmentType;

    public MessageUpsertDTO getMessageUpsertDTO() {
        MessageUpsertDTO messageUpsertDTO = new MessageUpsertDTO();
        messageUpsertDTO.setMessageText(messageText);
        messageUpsertDTO.setParentMessageId(parentMessageId);
        messageUpsertDTO.setGifUrl(gifUrl);

        return messageUpsertDTO;
    }

    public DocUploadRequestDTO getDocUploadRequestDTO() {
        DocUploadRequestDTO uploadRequestDTO = new DocUploadRequestDTO();
        uploadRequestDTO.setFileNames(List.of(fileName));
        uploadRequestDTO.setIsGroup(false);

        return uploadRequestDTO;
    }

    public boolean isGifAttachment() {
        return gifUrl != null && !gifUrl.isEmpty();
    }
}
