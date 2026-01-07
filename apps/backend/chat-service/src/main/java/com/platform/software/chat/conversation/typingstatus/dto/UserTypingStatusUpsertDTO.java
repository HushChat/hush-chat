package com.platform.software.chat.conversation.typingstatus.dto;

import lombok.Data;

@Data
public class UserTypingStatusUpsertDTO {
    private Long userId;
    private Long conversationId;
    private boolean typing;
}
