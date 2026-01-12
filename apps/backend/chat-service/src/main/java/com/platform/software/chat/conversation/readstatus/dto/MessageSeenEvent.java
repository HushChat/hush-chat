package com.platform.software.chat.conversation.readstatus.dto;

public record MessageSeenEvent(String workspaceId, Long conversationId, Long actorUserId, Long lastSeenMessageId) {
}
