package com.platform.software.common.model;

public enum MediaPathEnum {
    GROUP_PICTURE("chat-service/conversation/%s"),
    PROFILE_PICTURE("chat-service/profile/%s");

    private final String name;

    MediaPathEnum(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
