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