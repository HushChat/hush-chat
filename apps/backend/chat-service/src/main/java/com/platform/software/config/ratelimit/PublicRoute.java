package com.platform.software.config.ratelimit;

import lombok.Getter;

@Getter
public enum PublicRoute {
    HEALTH_CHECK("/health-check"),
    PUBLIC_USER("/public/user");

    private final String path;

    PublicRoute(String path) {
        this.path = path;
    }
}
