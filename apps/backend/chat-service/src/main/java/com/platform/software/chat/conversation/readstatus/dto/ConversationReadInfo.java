package com.platform.software.chat.conversation.readstatus.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class ConversationReadInfo {
    private Long lastSeenMessageId;
    private Long unreadCount;
}