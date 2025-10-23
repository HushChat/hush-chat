package com.platform.software.chat.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatSummaryDTO {
    private long activeConversations;
    private long favoriteCount;
    private long archivedCount;
    private long pinnedCount;
    private long mutedCount;
}

