package com.platform.software.config.cache;

import com.platform.software.config.workspace.WorkspaceContext;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.util.StringUtils;

import java.lang.reflect.Method;

public class WorkspaceAwareCacheKeyGenerator implements KeyGenerator {

    @Override
    public Object generate(Object target, Method method, Object... params) {
        String workspaceId = WorkspaceContext.getCurrentWorkspace();
        if (!StringUtils.hasText(workspaceId)) {
            throw new IllegalStateException("No workspace ID found in workspaceContext");
        }

        String cacheName = method.getAnnotation(org.springframework.cache.annotation.Cacheable.class).value()[0];

        return CacheKeyUtil.generateCacheKey(workspaceId, cacheName, params);
    }
}