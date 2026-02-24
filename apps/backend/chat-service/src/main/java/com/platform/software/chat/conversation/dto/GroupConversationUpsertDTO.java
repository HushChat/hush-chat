package com.platform.software.chat.conversation.dto;

import java.util.List;
import lombok.Data;

@Data
public class GroupConversationUpsertDTO {
    private String name;
    private String imageIndex;
    private String description;
    private List<Long> participantUserIds;
    private String imageFileName;
    private Boolean onlyAdminsCanSendMessages;
    private Boolean addAllWorkspaceUsers;
}
