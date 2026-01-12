package com.platform.software.chat.conversation.readstatus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MessageReadStatusWSResponseDTO {
    private Long conversationId;
    private Long lastSeenMessageId;
}
