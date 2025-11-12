package com.platform.software.chat.conversation.dto;

import lombok.Data;

import java.util.List;

@Data
public class GroupConversationUpsertDTO {
    private String name;
    private String imageIndex;
    private String description;
    private List<Long> participantUserIds;
    private String imageFileName;
}
