package com.platform.software.chat.conversation.dto;

import com.platform.software.chat.conversation.entity.Conversation;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class ConversationUpdateEvent {
    private final String workspaceId;
    private final Long actorUserId;
    private final Conversation conversation;
}
