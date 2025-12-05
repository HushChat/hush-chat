package com.platform.software.chat.message.dto;

import lombok.Getter;

@Getter
public enum MessageTypeEnum {
    TEXT("TEXT"),
    ATTACHMENT("ATTACHMENT"),
    AUDIO("AUDIO"),
    SYSTEM_EVENT("SYSTEM_EVENT");

    private final String name;

    MessageTypeEnum(String name) {
        this.name = name;
    }
}
