package com.platform.software.config.cache;

import org.springframework.data.domain.Pageable;


public class CacheKeyUtil {

    public static String generateCacheKey(String tenantId, String baseKey, Object... params) {
        StringBuilder keyBuilder = new StringBuilder(tenantId).append("::")
                .append(baseKey).append(':');

        if (params.length > 0) {
            for (Object param : params) {
                if (param instanceof Pageable pageable) {
                    keyBuilder.append("page").append(pageable.getPageNumber())
                            .append("size").append(pageable.getPageSize());
                } else {
                    keyBuilder.append(param).append(':');
                }
            }
        }

        return keyBuilder.toString();
    }
}