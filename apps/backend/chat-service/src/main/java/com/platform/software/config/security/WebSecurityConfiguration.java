package com.platform.software.config.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.web.filter.CorsFilter;

import com.platform.software.config.interceptors.JwtAuthorizationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class WebSecurityConfiguration {

    private final JwtAuthorizationFilter jwtRequestFilter;
    private final PublicRouteConfig publicRouteConfig;
    private final CorsConfig corsConfig;

    public WebSecurityConfiguration (JwtAuthorizationFilter jwtRequestFilter, PublicRouteConfig publicRouteConfig, CorsConfig corsConfig) {
        this.jwtRequestFilter = jwtRequestFilter;
        this.publicRouteConfig = publicRouteConfig;
        this.corsConfig = corsConfig;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> {})
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtRequestFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    WebSecurityCustomizer webSecurityCustomizer() {
        return publicRouteConfig.webSecurityCustomizer();
    }

    @Bean
    CorsFilter corsFilter() {
        return corsConfig.corsFilter();
    }
}
