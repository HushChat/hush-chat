package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.attachment.dto.MessageAttachmentDTO;
import com.platform.software.chat.message.entity.Message;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
public class BasicMessageDTO {
    private Long id;
    private Date createdAt;
    private Long senderId;
    private String senderFirstName;
    private String senderLastName;
    private String messageText;
    private Boolean isUnsend;
    private Boolean hasAttachment;
    private List<MessageAttachmentDTO> messageAttachments;
    private String senderSignedImageUrl;

    public BasicMessageDTO(Message message) {
        this.id = message.getId();
        this.createdAt = message.getCreatedAt();
        this.senderId = message.getSender().getId();
        this.senderFirstName = message.getSender().getFirstName();
        this.senderLastName = message.getSender().getLastName();
        this.messageText = message.getMessageText();
        this.isUnsend = message.getIsUnsend();
        this.hasAttachment = message.getAttachments() != null
                && !message.getAttachments().isEmpty();

        if (message.getAttachments() != null && !message.getAttachments().isEmpty()) {
            List<MessageAttachmentDTO> attachmentServices = message.getAttachments()
                    .stream()
                    .map(MessageAttachmentDTO::new)
                    .collect(Collectors.toList());

            this.setMessageAttachments(attachmentServices);
        }
    }
}
