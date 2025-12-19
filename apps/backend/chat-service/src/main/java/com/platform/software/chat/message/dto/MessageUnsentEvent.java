package com.platform.software.chat.message.dto;

import lombok.Getter;

@Getter
public class MessageUnsentEvent {
    private final String workspaceId;
    private final Long conversationId;
    private final Long messageId;
    private final Long actorUserId;

    public MessageUnsentEvent(String workspaceId, Long conversationId, Long messageId, Long actorUserId) {
        this.workspaceId = workspaceId;
        this.conversationId = conversationId;
        this.messageId = messageId;
        this.actorUserId = actorUserId;
    }
}
