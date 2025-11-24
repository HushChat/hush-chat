package com.platform.software.chat.call.entity;

public enum CallStatusEnum {
    ANSWERED("ANSWERED"),
    MISSED("MISSED"),
    REJECTED("REJECTED"),
    CANCELLED("CANCELLED"),
    INITIATED("INITIATED"),
    RINGING("RINGING"),
    FAILED("FAILED");

    private final String name;

    CallStatusEnum(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
