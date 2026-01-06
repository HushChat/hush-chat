package com.platform.software.chat.conversation.dto;

import com.platform.software.chat.message.dto.MessageViewDTO;

public record ConversationEventCreated(String workspaceId, Long conversationId, MessageViewDTO messageViewDTO, Long userId) {
}
