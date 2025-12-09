package com.platform.software.config.interceptors;

import com.platform.software.common.constants.Constants;
import com.platform.software.common.service.ErrorResponseHandler;
import com.platform.software.exception.ErrorResponses;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.HashSet;
import java.util.Set;

import static com.platform.software.common.constants.Constants.API_KEY_USER;

@Component
public class ApiKeyAuthorizationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(ApiKeyAuthorizationFilter.class);

    @Value("${public.api.key}")
    private String expectedApiKey;

    private static final String PROTECTED_PATH_PREFIX = "/protected/";

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith(PROTECTED_PATH_PREFIX);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String apiKey = request.getHeader(Constants.X_PUBLIC_KEY);
        String path = request.getRequestURI();

        if (apiKey == null) {
            logger.warn("Missing API key in request headers. Path: {}", path);
            ErrorResponseHandler.sendErrorResponse(response, HttpStatus.UNAUTHORIZED, ErrorResponses.FAILED_TO_GET_PUBLIC_KEY_RESPONSE);
            return;
        }

        if (!apiKey.equals(expectedApiKey)) {
            logger.warn("Incorrect API key provided. Path: {}", path);
            ErrorResponseHandler.sendErrorResponse(response, HttpStatus.UNAUTHORIZED, ErrorResponses.INCORRECT_PUBLIC_KEY_RESPONSE);
            return;
        }

        Set<GrantedAuthority> authorities = new HashSet<>();

        UsernamePasswordAuthenticationToken authentication =
                new UsernamePasswordAuthenticationToken(
                        API_KEY_USER,
                        null,
                        authorities
                );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        filterChain.doFilter(request, response);
    }
}