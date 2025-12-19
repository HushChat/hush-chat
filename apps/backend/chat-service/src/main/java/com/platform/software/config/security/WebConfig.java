package com.platform.software.config.security;

import com.platform.software.config.logging.LoggingMdcUserIdentifierFilter;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final AuthenticatedUserResolver authenticatedUserResolver;

    public WebConfig(AuthenticatedUserResolver authenticatedUserResolver) {
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    @Bean
    public FilterRegistrationBean<LoggingMdcUserIdentifierFilter> mdcUserEmailFilter() {
        FilterRegistrationBean<LoggingMdcUserIdentifierFilter> registrationBean = new FilterRegistrationBean<>();
        registrationBean.setFilter(new LoggingMdcUserIdentifierFilter());
        registrationBean.setOrder(Ordered.LOWEST_PRECEDENCE); // Or use a specific value like 1 (higher than the JWT filter)
        return registrationBean;
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(authenticatedUserResolver);
    }
}