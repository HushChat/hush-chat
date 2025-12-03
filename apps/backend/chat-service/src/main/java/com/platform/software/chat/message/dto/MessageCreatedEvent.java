package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.entity.Message;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MessageCreatedEvent {
    private final String workspaceId;
    private final Long conversationId;
    private final MessageViewDTO messageViewDTO;
    private final Long userId;
    private final Message message;
}
