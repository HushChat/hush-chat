package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.entity.Message;

public record MessagePinEvent(String workspace, Long conversationId, Message pinnedMessage, Long actorUserId) {
}
