package com.platform.software.exception;




import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@ControllerAdvice
public class GlobalExceptionHandler {
    Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(CustomUnauthorizedException.class)
    public ResponseEntity<Object> handleUnauthorizedException(CustomUnauthorizedException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", HttpStatus.UNAUTHORIZED.value());
        body.put("error", "Unauthorized");
        body.put("message", ex.getMessage());

        return new ResponseEntity<>(body, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(value = {Exception.class})
    public ResponseEntity<Object> handleAnyException(Exception e) {
        logger.error("[handleAnyException] An unexpected error occurred: {}", e.getMessage(), e);
        ErrorResponse errorResponse = new ErrorResponse("An unexpected error occurred. Please contact support.", ExceptionErrorCodes.INTERNAL_SERVER_ERROR, null);
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(value = {CustomAccessDeniedException.class})
    public ResponseEntity<Object> handleCustomException(CustomAccessDeniedException e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), ExceptionErrorCodes.FORBIDDEN, null);
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(value = {CustomBadRequestException.class})
    public ResponseEntity<Object> handleCustomException(CustomBadRequestException e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), ExceptionErrorCodes.BAD_REQUEST, null);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(value = {CustomInternalServerErrorException.class})
    public ResponseEntity<Object> handleCustomException(CustomInternalServerErrorException e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), ExceptionErrorCodes.INTERNAL_SERVER_ERROR, null);
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    @ExceptionHandler(value = {CustomCognitoServerErrorException.class})
    public ResponseEntity<Object> handleCustomException(CustomCognitoServerErrorException e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), ExceptionErrorCodes.BAD_GATEWAY, null);
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_GATEWAY);
    }

    @ExceptionHandler(value = {CustomResourceNotFoundException.class})
    public ResponseEntity<Object> handleCustomException(CustomResourceNotFoundException e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), ExceptionErrorCodes.NOT_FOUND, null);
        return new ResponseEntity<>(errorResponse, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(value = {CustomExpectationFailedException.class})
    public ResponseEntity<Object> handleCustomException(CustomExpectationFailedException e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), ExceptionErrorCodes.EXPECTATION_FAILED, null);
        return new ResponseEntity<>(errorResponse, HttpStatus.EXPECTATION_FAILED);
    }

    @ExceptionHandler(value = {CustomResourceConflictException.class})
    public ResponseEntity<Object> handleCustomException(CustomResourceConflictException e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), ExceptionErrorCodes.CONFLICT, null);
        return new ResponseEntity<>(errorResponse, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(CustomForbiddenException.class)
    public ResponseEntity<Object> handleCustomForbiddenException(CustomForbiddenException e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), ExceptionErrorCodes.FORBIDDEN, null);
        return new ResponseEntity<>(errorResponse, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(CustomTooManyRequestsException.class)
    public ResponseEntity<Object> handleCustomTooManyRequestsException(CustomTooManyRequestsException e) {
        ErrorResponse errorResponse = new ErrorResponse(e.getMessage(), ExceptionErrorCodes.TOO_MANY_REQUESTS, null);
        return new ResponseEntity<>(errorResponse, HttpStatus.TOO_MANY_REQUESTS);
    }

    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<Object> handleServiceUnavailableException(ServiceUnavailableException ex) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("error", "Service Unavailable");
        body.put("errorCode", ExceptionErrorCodes.INTERNAL_SERVER_ERROR);
        body.put("message", ex.getMessage());
        return new ResponseEntity<>(body, HttpStatus.SERVICE_UNAVAILABLE);
    }
}
