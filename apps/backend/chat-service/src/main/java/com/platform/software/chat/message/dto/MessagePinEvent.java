package com.platform.software.chat.message.dto;

public record MessagePinEvent(String workspace, Long conversationId, BasicMessageDTO pinnedMessage, Long actorUserId) {
}
