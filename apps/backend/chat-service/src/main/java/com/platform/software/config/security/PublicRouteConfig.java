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

import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;

@Configuration
public class PublicRouteConfig {
    public WebSecurityCustomizer webSecurityCustomizer() {
        return (web) -> {
            web.ignoring()
                    .requestMatchers(HttpMethod.GET, "/health-check/**")
                    .requestMatchers(HttpMethod.HEAD, "/health-check/**")
                    .requestMatchers(HttpMethod.POST, "/public/user/**")
                    .requestMatchers(HttpMethod.GET, "/ws-message-subscription/**")
                    .requestMatchers("/swagger-ui/**")
                    .requestMatchers("/swagger-ui.html")
                    .requestMatchers("/v3/api-docs/**");
         };
    }
}