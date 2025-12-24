package com.platform.software.chat.message.attachment.entity;

public enum AttachmentTypeEnum {
    IMAGE("IMAGE"),
    VIDEO("VIDEO"),
    AUDIO("AUDIO"),
    DOCUMENT("DOCUMENT"),
    GIF("GIF"),
    OTHER("OTHER");

    private final String name;

    AttachmentTypeEnum(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
