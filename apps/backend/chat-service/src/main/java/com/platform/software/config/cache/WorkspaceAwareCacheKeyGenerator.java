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