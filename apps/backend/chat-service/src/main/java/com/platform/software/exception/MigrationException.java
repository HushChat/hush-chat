package com.platform.software.exception;

public class MigrationException extends RuntimeException {
    public MigrationException(String message) {
        super(message);
    }
    public MigrationException(String message, Throwable cause) {
        super(message, cause);
    }
}
