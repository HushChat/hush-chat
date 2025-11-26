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
                    .requestMatchers(HttpMethod.GET,"/public/workspaces/**")
                    .requestMatchers("/swagger-ui/**")
                    .requestMatchers("/swagger-ui.html")
                    .requestMatchers("/v3/api-docs/**");
         };
    }
}