package com.platform.software.chat.message.dto;

import lombok.Data;

@Data
public class MessagePinWSResponseDTO {
    private Long conversationId;
    private BasicMessageDTO pinnedMessage;
}
