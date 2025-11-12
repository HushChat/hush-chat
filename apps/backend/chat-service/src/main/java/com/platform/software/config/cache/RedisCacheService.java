package com.platform.software.config.cache;

import com.platform.software.config.workspace.WorkspaceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import java.util.List;
import java.util.Set;

@Service
public class RedisCacheService implements CacheService {
    Logger logger = LoggerFactory.getLogger(RedisCacheService.class);

    private final RedisTemplate<String, Object> redisTemplate;
    private final CacheManager cacheManager;
    
    public RedisCacheService(RedisTemplate<String, Object> redisTemplate, CacheManager cacheManager) {
        this.redisTemplate = redisTemplate;
        this.cacheManager = cacheManager;
    }

    public String generateCacheKey(String baseKey, Object... params) {
        String workspaceId = WorkspaceContext.getCurrentWorkspace();
        if (!StringUtils.hasText(workspaceId)) {
            throw new IllegalStateException("No workspaceId ID found in WorkspaceContext");
        }

        return CacheKeyUtil.generateCacheKey(workspaceId, baseKey, params);
    }

    @Override
    public void evictByPatternsForCurrentWorkspace(List<String> cacheNames) {
        String workspaceId = WorkspaceContext.getCurrentWorkspace();
        for (String cacheName : cacheNames) {
            String pattern;
            pattern = cacheName + "::" + workspaceId + "*";
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        }
    }

    @Override
    public void evictByPatternsForAllWorkspaces(List<String> cacheNames) {
        for (String cacheName : cacheNames) {
            String pattern;
            pattern = "*" + cacheName + "*";
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        }
    }

    @Override
    public void evictByLastPartsForCurrentWorkspace(List<String> lastParts) {
        String workspaceId = WorkspaceContext.getCurrentWorkspace();
        for (String lastPart : lastParts) {
            String pattern = "*" + "::" + workspaceId + "::" + "*" + lastPart+ ":" + "*";
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
            }
        }
    }

    @Override
    public void updateCacheValue(Object value, String cacheName, Object... cacheKeyParams) {
        String key = generateCacheKey(cacheName, cacheKeyParams);
        Cache cache = cacheManager.getCache(cacheName);

        try {
            cache.put(key, value);
        } catch (Exception e) {
            logger.error("error while updating cache and evicting cache for key: {}", key, e);
            cache.evict(key);
        }
    }
    
    @Override
    public <T> T get(List<String> cacheNames) {
        String workspaceId = WorkspaceContext.getCurrentWorkspace();
        for (String cacheName : cacheNames) {
            String pattern = cacheName + "::" + workspaceId + "*";
            Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                String key = keys.iterator().next();
                return (T) redisTemplate.opsForValue().get(key);
            }
        }
        return null;
    }

    public void clearAllCache() {
        Set<String> keys = redisTemplate.keys("*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Override
    public void setWithTTL(String cacheName, Object value, long ttlInMinutes, Object... cacheKeyParams) {
        String key = generateCacheKey(cacheName, cacheKeyParams);
        try {
            redisTemplate.opsForValue().set(key, value, java.time.Duration.ofMinutes(ttlInMinutes));
        } catch (Exception e) {
            logger.error("Failed to set cache with TTL for key: {}", key, e);
        }
    }

    @Override
    public <T> T getByExactKey(String cacheName, Object... cacheKeyParams) {
        String key = generateCacheKey(cacheName, cacheKeyParams);
        try {
            return (T) redisTemplate.opsForValue().get(key);
        } catch (Exception e) {
            logger.error("Failed to get value from Redis for key: {}", key, e);
            return null;
        }
    }

    @Override
    public void deleteByExactKey(String cacheName, Object... cacheKeyParams) {
        String key = generateCacheKey(cacheName, cacheKeyParams);
        try {
            redisTemplate.delete(key);
            logger.info("Deleted cache for key: {}", key);
        } catch (Exception e) {
            logger.error("Failed to delete cache for key: {}", key, e);
        }
    }


    public boolean isAllowedToResendSignupCode(String email, Long projectId, long ttlInMinutes) {
        String cacheName = "resend_signup_rate_limit";
        String key = generateCacheKey(cacheName, email.toLowerCase(), projectId);
        
        Boolean hasKey = redisTemplate.hasKey(key);
        if (Boolean.TRUE.equals(hasKey)) {
            return false;
        }
    
        try {
            redisTemplate.opsForValue().set(key, "1", java.time.Duration.ofMinutes(ttlInMinutes));
        } catch (Exception e) {
            logger.error("failed to set resend signup rate limit key: {}", key, e);
        }
    
        return true;
    }    
}