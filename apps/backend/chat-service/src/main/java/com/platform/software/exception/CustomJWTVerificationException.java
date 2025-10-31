package com.platform.software.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.UNAUTHORIZED)
public class CustomJWTVerificationException extends RuntimeException {
    public CustomJWTVerificationException(String message) {
        super(message);
    }

    public CustomJWTVerificationException(String message, Throwable cause) {
        super(message, cause);
    }
}