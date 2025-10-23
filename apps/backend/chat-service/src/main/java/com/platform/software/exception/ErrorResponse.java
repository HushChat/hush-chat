package com.platform.software.exception;

import java.util.List;

public class ErrorResponse {
    private String message;
    private String errorCode;
    private List<String> details;

    public ErrorResponse(String message, String errorCode, List<String> details) {
        this.message = message;
        this.errorCode = errorCode;
        this.details = details;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public void setErrorCode(String errorCode) {
        this.errorCode = errorCode;
    }

    public List<String> getDetails() {
        return details;
    }

    public void setDetails(List<String> details) {
        this.details = details;
    }
}
