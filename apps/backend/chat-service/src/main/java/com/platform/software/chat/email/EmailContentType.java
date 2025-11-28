package com.platform.software.chat.email;

import lombok.Getter;

@Getter
public enum EmailContentType {
    TEXT_PLAIN("text/plain"),
    TEXT_HTML("text/html");

    private final String type;

    EmailContentType(String type) {
        this.type = type;
    }
}
