/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package com.platform.software.utils;

import java.util.Set;

import com.platform.software.exception.CustomBadRequestException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

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