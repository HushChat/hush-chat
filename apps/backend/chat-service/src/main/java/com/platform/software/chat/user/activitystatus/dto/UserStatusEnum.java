package com.platform.software.chat.user.activitystatus.dto;

import com.platform.software.chat.user.entity.ChatUserStatus;

public enum UserStatusEnum {
    ONLINE("ONLINE"),
    OFFLINE("OFFLINE"),
    AWAY("AWAY"),
    BUSY("BUSY"),
    AVAILABLE("AVAILABLE");

    private final String name;

    UserStatusEnum(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }

    public ChatUserStatus toChatUserStatus() {
        return switch (this) {
            case ONLINE, AVAILABLE -> ChatUserStatus.ONLINE;
            case OFFLINE -> ChatUserStatus.OFFLINE;
            case AWAY -> ChatUserStatus.AWAY;
            case BUSY -> ChatUserStatus.BUSY;
            default -> throw new IllegalStateException("Unexpected value: " + this);
        };
    }

    public static UserStatusEnum fromString(String name) {
        for (UserStatusEnum status : UserStatusEnum.values()) {
            if (status.name.equalsIgnoreCase(name)) {
                return status;
            }
        }
        throw new IllegalArgumentException("No enum constant with name: " + name);
    }
}