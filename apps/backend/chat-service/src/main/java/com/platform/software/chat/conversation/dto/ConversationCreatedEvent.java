package com.platform.software.chat.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ConversationCreatedEvent {
    private final String workspaceId;
    private final Long conversationId;
    private final Long actorUserId;         
    private final ConversationDTO conversationDTO;
}
