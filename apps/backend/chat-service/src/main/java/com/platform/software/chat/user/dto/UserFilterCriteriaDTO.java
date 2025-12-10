package com.platform.software.chat.user.dto;

import lombok.Data;

@Data
public class UserFilterCriteriaDTO {
    private String keyword;
    private Long excludeUsersInConversationId;
    private Boolean isFavorite ;
    private Boolean isMuted;
}
