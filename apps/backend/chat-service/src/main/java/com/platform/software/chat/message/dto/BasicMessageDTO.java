package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.entity.Message;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BasicMessageDTO {
    private Long id;
    private Long senderId;
    private String senderFirstName;
    private String senderLastName;
    private String messageText;
    private Boolean isUnsend;

    public BasicMessageDTO(Message message) {
        this.id = message.getId();
        this.senderId = message.getSender().getId();
        this.senderFirstName = message.getSender().getFirstName();
        this.senderLastName = message.getSender().getLastName();
        this.messageText = message.getMessageText();
        this.isUnsend = message.getIsUnsend();
    }
}
