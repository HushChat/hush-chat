package com.platform.software.common.model;

import lombok.Getter;

@Getter
public enum MediaSizeEnum {
    LARGE("large"),
    SMALL("small"),
    MEDIUM("medium");

    private final String name;

    MediaSizeEnum(String name) {
        this.name = name;
    }
}
