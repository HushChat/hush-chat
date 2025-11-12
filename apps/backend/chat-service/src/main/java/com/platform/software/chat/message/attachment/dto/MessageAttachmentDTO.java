package com.platform.software.chat.message.attachment.dto;

import com.platform.software.chat.message.attachment.entity.AttachmentType;
import com.platform.software.chat.message.attachment.entity.MessageAttachment;
import com.platform.software.common.model.ModelMapper;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class MessageAttachmentDTO implements ModelMapper<MessageAttachment> {
    private Long id;
    private AttachmentType attachmentType;
    private String originalFileName;
    private String indexedFileName;
    private String fileUrl;

    public MessageAttachmentDTO(MessageAttachment messageAttachment) {
        this.mapToSelf(messageAttachment);
    }

    @Override
    public MessageAttachment getModel() {
        return null;
    }

    @Override
    public MessageAttachment mapToModel(MessageAttachment dto) {
        return null;
    }

    @Override
    public void mapToSelf(MessageAttachment dto) {
        this.id = dto.getId();
        this.attachmentType = dto.getAttachmentType();
        this.originalFileName = dto.getOriginalFileName();
        this.indexedFileName = dto.getIndexedFileName();
    }
}