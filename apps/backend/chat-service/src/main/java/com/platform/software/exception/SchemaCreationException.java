package com.platform.software.exception;

public class SchemaCreationException extends RuntimeException {
    public SchemaCreationException(String message) {
        super(message);
    }
    public SchemaCreationException(String message, Throwable cause) {
        super(message, cause);
    }
}
