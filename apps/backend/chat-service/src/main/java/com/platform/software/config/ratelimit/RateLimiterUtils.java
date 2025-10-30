package com.platform.software.config.ratelimit;

import java.util.Arrays;
import java.util.Set;
import java.util.stream.Collectors;

public class RateLimiterUtils {
    private static final Set<String> PUBLIC_ROUTES = Arrays.stream(PublicRoute.values())
            .map(PublicRoute::getPath)
            .collect(Collectors.toSet());

    public static boolean isPublicRoute(String requestURI) {
        return PUBLIC_ROUTES.stream().anyMatch(requestURI::contains);
    }


}
