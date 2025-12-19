package com.platform.software.common.model;

import lombok.Getter;

@Getter
public enum MediaPathEnum {
    GROUP_PICTURE("chat-service/conversation/%s"),
    PROFILE_PICTURE("chat-service/profile/%s"),
    MESSAGE_ATTACHMENT("chat-service/message-attachments/%s"),

    RESIZED_MESSAGE_ATTACHMENT("resized-images/message-attachments/%s/%s"),
    RESIZED_PROFILE_PICTURE("resized-images/profile/%s/%s"),
    RESIZED_GROUP_PICTURE("resized-images/conversation/%s/%s");

    private final String name;

    MediaPathEnum(String name) {
        this.name = name;
    }
}
