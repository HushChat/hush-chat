package com.platform.software.chat.user.activitystatus.dto;

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

    public static UserStatusEnum fromString(String name) {
        for (UserStatusEnum status : UserStatusEnum.values()) {
            if (status.name.equalsIgnoreCase(name)) {
                return status;
            }
        }
        throw new IllegalArgumentException("No enum constant with name: " + name);
    }
}