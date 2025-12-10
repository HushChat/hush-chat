package com.platform.software.config.logging;

import java.io.IOException;
import com.platform.software.common.constants.Constants;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.slf4j.MDC;
import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class LoggingMdcUserIdentifierFilter extends OncePerRequestFilter {

    private static final String USER_IDENTIFIER_MDC_KEY = "userContext";

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request, @NonNull HttpServletResponse response, @NonNull FilterChain filterChain)
            throws ServletException, IOException {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.getPrincipal() != null) {
                String userEmail = authentication.getPrincipal().toString();
                String clientIpAddress = request.getHeader("X-FORWARDED-FOR");
                if(clientIpAddress == null) {
                    clientIpAddress = request.getRemoteAddr();
                }
                MDC.put(USER_IDENTIFIER_MDC_KEY, "email: %s, ip: %s,".formatted(userEmail, clientIpAddress));
            }

            // Add `x-uuid` Header to MDC
            String requestUuid = request.getHeader(Constants.API_REQUEST_ID);
            if (requestUuid != null && !requestUuid.isEmpty()) {
                MDC.put(Constants.API_REQUEST_ID, requestUuid); // Store UUID in MDC for logging
            }
            else {
                System.out.println("No uuid found");
            }

            filterChain.doFilter(request, response);
        } finally {
            MDC.remove(USER_IDENTIFIER_MDC_KEY);
        }
    }
}

