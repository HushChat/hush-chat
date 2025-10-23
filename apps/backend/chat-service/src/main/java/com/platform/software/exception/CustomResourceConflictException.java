package com.platform.software.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class CustomResourceConflictException extends RuntimeException {
    public CustomResourceConflictException(String message) {
        super(message);
    }
}