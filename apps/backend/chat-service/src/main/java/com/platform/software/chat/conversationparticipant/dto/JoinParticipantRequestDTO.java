package com.platform.software.chat.conversationparticipant.dto;

import lombok.Data;

import java.util.Set;

@Data
public class JoinParticipantRequestDTO {

    private Set<Long> userIds;
    private Boolean addAllWorkspaceUsers;
}
