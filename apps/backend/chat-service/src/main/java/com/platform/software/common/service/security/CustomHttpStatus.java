package com.platform.software.common.service.security;

import lombok.Getter;

public enum CustomHttpStatus {
    WORKSPACE_ID_MISSING(430, "Workspace ID Missing");

    private final int value;
    @Getter
    private final String reason;

    CustomHttpStatus(int value, String reason) {
        this.value = value;
        this.reason = reason;
    }

    public int value() {
        return this.value;
    }
}