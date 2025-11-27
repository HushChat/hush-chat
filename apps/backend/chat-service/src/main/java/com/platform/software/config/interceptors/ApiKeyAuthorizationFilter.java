package com.platform.software.config.interceptors;

import com.platform.software.common.constants.Constants;
import com.platform.software.common.service.ErrorResponseHandler;
import com.platform.software.exception.ErrorResponses;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class ApiKeyAuthorizationFilter extends OncePerRequestFilter {

    @Value("${public.api.key}")
    private String apiKey;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String apiKey = request.getHeader(Constants.X_PUBLIC_KEY);

        if(apiKey == null) {
            ErrorResponseHandler.sendErrorResponse(response, HttpStatus.UNAUTHORIZED, ErrorResponses.FAILED_TO_GET_PUBLIC_KEY_RESPONSE);
            return;
        }

        if ("expected-api-key-value".equals(apiKey)) {
            filterChain.doFilter(request, response);
        } else {
            ErrorResponseHandler.sendErrorResponse(response, HttpStatus.UNAUTHORIZED, ErrorResponses.INCORRECT_PUBLIC_KEY_RESPONSE);
        }

    }
}
