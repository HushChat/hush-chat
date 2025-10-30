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

package com.platform.software.config.security;

import com.platform.software.common.constants.Constants;
import com.platform.software.common.constants.GeneralConstants;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

@Configuration
public class CorsConfig {
    @Value("${allowed-origins}")
    private String allowedOrigins;

    public CorsFilter corsFilter() {
        List<String> allowedOriginList;

        final UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        final CorsConfiguration config = new CorsConfiguration();

        if (Objects.equals(allowedOrigins, "*")) {
            config.setAllowCredentials(false);
            allowedOriginList = Collections.singletonList("*");
        } else {
            config.setAllowCredentials(true);
            allowedOriginList = Arrays.asList(allowedOrigins.split(","));
        }

        config.setAllowedOrigins(allowedOriginList);
        config.setAllowedHeaders(Arrays.asList("Origin", Constants.API_REQUEST_ID, "Content-Type", "Accept", "Authorization", GeneralConstants.X_TENANT_HEADER, Constants.X_SECRET_KEY, Constants.X_PLATFORM_ID_HEADER));
        config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "OPTIONS", "DELETE", "PATCH"));
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}