/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
