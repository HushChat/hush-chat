package com.platform.software.chat.message.attachment.entity;

public enum AttachmentFilterTypeEnum {
    MEDIA("media"),
    DOCS("docs");

    private final String name;

    AttachmentFilterTypeEnum(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
