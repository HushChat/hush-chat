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
