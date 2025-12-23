package com.platform.software.chat.user.activitystatus.dto;

import lombok.Data;

import java.util.Set;

@Data
public class UserActivityWSSubscriptionData {
    private String workspaceId; // TODO: if we can get these via annotation, identified by interceptor, it would be better
    private String email;

    private Set<Long> visibleConversations; // list of conversations visible - mobile or web
    private Long openedConversation; // indicates user's selected conversation, could be null
    private String deviceType;
}