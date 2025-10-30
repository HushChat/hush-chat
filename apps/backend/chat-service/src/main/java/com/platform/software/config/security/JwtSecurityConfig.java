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


import com.platform.software.config.aws.AWSCognitoConfig;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.interceptors.JwtAuthorizationFilter;

@Configuration
public class JwtSecurityConfig {

    private final UserService userService;
    private final AWSCognitoConfig awsCognitoConfig;

    public JwtSecurityConfig (UserService userService, AWSCognitoConfig awsCognitoConfig) {
        this.userService = userService;
        this.awsCognitoConfig = awsCognitoConfig;
    }

    public void configure(HttpSecurity http) throws Exception {
        http.addFilterBefore(
            new JwtAuthorizationFilter(userService, awsCognitoConfig),
            UsernamePasswordAuthenticationFilter.class);
    }
}
