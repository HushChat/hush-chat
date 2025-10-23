package com.platform.software.exception;

public class CustomTooManyRequestsException extends RuntimeException {
    public CustomTooManyRequestsException(String message) {
        super(message);
    }
}