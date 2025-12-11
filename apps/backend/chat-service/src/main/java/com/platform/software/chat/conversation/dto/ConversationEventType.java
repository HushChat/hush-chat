package com.platform.software.chat.conversation.dto;

import lombok.Getter;

@Getter
public enum ConversationEventType {
    USER_ADDED("USER_ADDED"),
    USER_REMOVED("USER_REMOVED"),
    USER_LEFT("USER_LEFT"),
    USER_JOINED("USER_JOINED"),
    GROUP_RENAMED("GROUP_RENAMED"),
    GROUP_IMAGE_CHANGED("GROUP_IMAGE_CHANGED"),
    GROUP_DESCRIPTION_CHANGED("GROUP_DESCRIPTION_CHANGED"),
    USER_PROMOTED_TO_ADMIN("USER_PROMOTED_TO_ADMIN"),
    USER_REMOVED_FROM_ADMIN("USER_REMOVED_FROM_ADMIN"),
    GROUP_CREATED("GROUP_CREATED"),
    MESSAGE_PINNED("MESSAGE_PINNED");

    private final String name;

    ConversationEventType(String name) {
        this.name = name;
    }
}