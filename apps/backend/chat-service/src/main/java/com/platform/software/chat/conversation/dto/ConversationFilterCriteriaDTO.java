package com.platform.software.chat.conversation.dto;

import lombok.Data;

@Data
public class ConversationFilterCriteriaDTO {
    private Boolean isArchived;
    private Boolean isUnread;
    private Boolean isFavorite;
    private String searchKeyword;
}
