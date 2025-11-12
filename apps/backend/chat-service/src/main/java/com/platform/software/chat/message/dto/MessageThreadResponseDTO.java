package com.platform.software.chat.message.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageThreadResponseDTO {
    private MessageViewDTO targetMessage;
    private List<MessageViewDTO> parentChain;
    
    public MessageThreadResponseDTO(MessageViewDTO targetMessage) {
        this.targetMessage = targetMessage;
        this.parentChain = null;
    }
}