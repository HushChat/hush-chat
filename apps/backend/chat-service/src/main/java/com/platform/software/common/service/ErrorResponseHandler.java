package com.platform.software.common.service;

import com.platform.software.common.constants.Constants;
import com.platform.software.common.service.security.CustomHttpStatus;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;

import java.io.IOException;

public class ErrorResponseHandler {
    public static void sendErrorResponse(HttpServletResponse response, HttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(Constants.APPLICATION_JSON_CONTENT_TYPE);
        response.getWriter().write("{\"error\": \"%s\"}".formatted(message));
    }

    public static void sendErrorResponse(HttpServletResponse response, CustomHttpStatus status, String message) throws IOException {
        response.setStatus(status.value());
        response.setContentType(Constants.APPLICATION_JSON_CONTENT_TYPE);
        response.getWriter().write("{\"error\": \"%s\"}".formatted(message));
    }
}
