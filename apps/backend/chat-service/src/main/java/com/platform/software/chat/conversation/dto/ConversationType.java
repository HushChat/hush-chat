package com.platform.software.chat.conversation.dto;

public enum ConversationType {
    ALL("ALL"),
    UNREAD("UNREAD"),
    GROUPS("GROUPS"),
    MUTED("MUTED"),
    FAVORITES("FAVORITES");

    private final String name;

    private ConversationType(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
