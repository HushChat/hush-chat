package com.platform.software.config.security;


import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.aws.AWSCognitoConfig;
import com.platform.software.config.interceptors.JwtAuthorizationFilter;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class JwtSecurityConfig {

    private final UserService userService;
    private final AWSCognitoConfig awsCognitoConfig;

    public JwtSecurityConfig(UserService userService, AWSCognitoConfig awsCognitoConfig) {
        this.userService = userService;
        this.awsCognitoConfig = awsCognitoConfig;
    }

    public void configure(HttpSecurity http) throws Exception {
        http.addFilterBefore(
                new JwtAuthorizationFilter(userService, awsCognitoConfig),
                UsernamePasswordAuthenticationFilter.class);
    }
}
