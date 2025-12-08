package com.platform.software.config.security;


import com.platform.software.config.aws.AWSCognitoConfig;
import com.platform.software.platform.workspaceuser.service.WorkspaceUserService;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.interceptors.JwtAuthorizationFilter;

@Configuration
public class JwtSecurityConfig {

    private final UserService userService;
    private final AWSCognitoConfig awsCognitoConfig;
    private final WorkspaceUserService workspaceUserService;

    public JwtSecurityConfig (UserService userService, AWSCognitoConfig awsCognitoConfig, WorkspaceUserService workspaceUserService) {
        this.userService = userService;
        this.awsCognitoConfig = awsCognitoConfig;
        this.workspaceUserService = workspaceUserService;
    }

    public void configure(HttpSecurity http) throws Exception {
        http.addFilterBefore(
            new JwtAuthorizationFilter(userService, awsCognitoConfig, workspaceUserService),
            UsernamePasswordAuthenticationFilter.class);
    }
}
