package com.platform.software.chat.message.dto;

import lombok.Getter;

@Getter
public enum MessageTypeEnum {
    TEXT("TEXT"),
    ATTACHMENT("ATTACHMENT"),
    SYSTEM_EVENT("SYSTEM_EVENT"),
    BOT_MESSAGE("BOT_MESSAGE");

    private final String name;

    MessageTypeEnum(String name) {
        this.name = name;
    }
}
