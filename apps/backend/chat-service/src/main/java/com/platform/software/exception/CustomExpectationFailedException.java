package com.platform.software.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.EXPECTATION_FAILED)
public class CustomExpectationFailedException extends RuntimeException {
    public CustomExpectationFailedException(String message) {
        super(message);
    }

    public CustomExpectationFailedException(String message, Throwable cause) {
        super(message, cause);
    }

}
