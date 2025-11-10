package com.platform.software.chat.conversation.readstatus.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ConversationUnreadCount {
    private Long conversationId;
    private Long unreadCount;
}