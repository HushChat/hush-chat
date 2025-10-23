package com.platform.software.chat.message.entity;

public enum ReactionTypeEnum {
    THUMBS_UP("THUMBS_UP"),
    LOVE("LOVE"),
    HAHA("HAHA"),
    WOW("WOW"),
    ANGRY("ANGRY"),
    SAD("SAD");

    private final String name;

    ReactionTypeEnum(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}
