package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.user.entity.ChatUser;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class MessageCreatedEvent {
    private final String workspaceId;
    private final Long conversationId;
    private final MessageViewDTO messageViewDTO;
    private final Long userId;
    private final Message message;
}
