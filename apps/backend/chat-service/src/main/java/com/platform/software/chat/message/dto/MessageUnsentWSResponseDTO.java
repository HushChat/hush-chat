package com.platform.software.chat.message.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MessageUnsentWSResponseDTO {
    private Long conversationId;
    private Long messageId;
    private Long actorUserId;
}
