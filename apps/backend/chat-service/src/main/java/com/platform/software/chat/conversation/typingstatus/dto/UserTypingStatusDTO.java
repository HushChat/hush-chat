package com.platform.software.chat.conversation.typingstatus.dto;

import lombok.Data;

@Data
public class UserTypingStatusDTO {
    private String workspaceId;
    private Long conversationId;
    private boolean typing;
    private String deviceType;
    private String deviceId;
}
