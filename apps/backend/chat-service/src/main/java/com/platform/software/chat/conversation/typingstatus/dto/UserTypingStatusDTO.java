package com.platform.software.chat.conversation.typingstatus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserTypingStatusDTO {
    private String chatUserName;
    private Long conversationId;
    private boolean typing;
}
