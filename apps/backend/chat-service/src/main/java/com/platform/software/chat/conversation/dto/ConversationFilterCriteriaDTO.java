package com.platform.software.chat.conversation.dto;

import lombok.Data;

@Data
public class ConversationFilterCriteriaDTO {
    private Boolean isArchived;
    private Boolean isFavorite;
    private String searchKeyword;
    private Boolean isGroup;
    private Boolean isMuted;
}
