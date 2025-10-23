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