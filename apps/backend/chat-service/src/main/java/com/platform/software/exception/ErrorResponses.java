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

package com.platform.software.exception;

public class ErrorResponses {
    public static final String TENANT_ID_MISSING_RESPONSE = "tenant id is missing";
    public static final String UNAUTHORIZED_ACCESS_RESPONSE = "unauthorized access";
    public static final String JWT_TOKEN_MISSING_RESPONSE = "jwt token missing";
    public static final String PLATFORM_ID_MISSING_RESPONSE = "platform id missing";
    public static final String INVALID_TENANT_ID_WAS_GIVEN_RESPONSE = "invalid tenant id was given";
    public static final String FAILED_TO_VERIFY_TOKEN_RESPONSE = "failed to verify token";
    public static final String INVALID_TOKEN_PROVIDED_RESPONSE = "invalid token provided";
    public static final String INVALID_PLATFORM_ID_PROVIDED_RESPONSE = "invalid platform id provided";
    public static final String FAILED_TO_GET_PUBLIC_KEY_RESPONSE = "failed to get public key";
    public static final String USER_TYPE_IS_NULL_RESPONSE = "user type is null";
    public static final String TENANT_IS_NULL_RESPONSE = "tenant is null";
    public static final String FAILED_TO_VERIFY_REQUEST_RESPONSE = "failed to verify request";
    public static final String IP_NOT_AUTHORIZED_RESPONSE = "Your IP is not authorized to access this service. Please contact your administrator.";
    public static final String DATABASE_UNAVAILABLE_RESPONSE = "Database is currently unavailable. Please try again later.";
    public static final String FAILED_TO_VALIDATE_TOKEN_RESPONSE = "failed to validate token";
    public static final String INVALID_USER_TYPE_RESPONSE = "invalid user type";
}