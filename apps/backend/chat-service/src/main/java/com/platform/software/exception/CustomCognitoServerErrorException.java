package com.platform.software.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_GATEWAY)
public class CustomCognitoServerErrorException extends RuntimeException {
    public CustomCognitoServerErrorException(String message) {
        super(message);
    }

    public CustomCognitoServerErrorException(String message, Throwable cause) {
        super(message, cause);
    }
}
