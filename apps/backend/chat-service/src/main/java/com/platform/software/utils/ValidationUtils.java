package com.platform.software.utils;

import com.platform.software.exception.CustomBadRequestException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import java.util.Set;

public class ValidationUtils {

    public static <T> void validate(T object) {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        Validator validator = factory.getValidator();

        Set<ConstraintViolation<T>> violations = validator.validate(object);
        if (!violations.isEmpty()) {
            StringBuilder errorMessageBuilder = new StringBuilder();
            errorMessageBuilder.append("Validation errors found: ");
            for (ConstraintViolation<T> violation : violations) {
                String message = violation.getPropertyPath() + ": " + violation.getMessage() + ";";
                if (!errorMessageBuilder.toString().contains(message)) {
                    errorMessageBuilder.append(message);
                }
            }
            throw new CustomBadRequestException(errorMessageBuilder.toString());
        }
    }
}