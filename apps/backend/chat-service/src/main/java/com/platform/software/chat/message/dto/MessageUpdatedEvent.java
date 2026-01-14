package com.platform.software.chat.message.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MessageUpdatedEvent {
    private final String workspaceId;
    private final Long conversationId;
    private final MessageViewDTO messageViewDTO;
    private final Long actorUserId;
}
