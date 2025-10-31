package com.platform.software.common.model;

public enum UserTypeEnum {
    CHAT_USER("CHAT_USER");

    private final String name;

    UserTypeEnum(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}