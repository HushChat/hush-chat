package com.platform.software.chat.conversationparticipant.entity;

public enum ConversationParticipantRoleEnum {
    MEMBER("MEMBER"),
    ADMIN("ADMIN");

    private final String name;

    ConversationParticipantRoleEnum(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

}
