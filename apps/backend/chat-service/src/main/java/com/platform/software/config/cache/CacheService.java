package com.platform.software.config.cache;

import java.util.List;

public interface CacheService {

    void evictByPatternsForCurrentWorkspace(List<String> cacheNames);

    void evictByLastPartsForCurrentWorkspace(List<String> lastParts);

    void evictByPatternsForAllWorkspaces(List<String> cacheNames);

    void updateCacheValue(Object value, String cacheName, Object... cacheKeyParams);

    <T> T get(List<String> cacheNames);

    void clearAllCache();

    void setWithTTL(String cacheName, Object value, long ttlInMinutes, Object... cacheKeyParams);
    
    <T> T getByExactKey(String cacheName, Object... cacheKeyParams);

    void deleteByExactKey(String cacheName, Object... cacheKeyParams);

}
