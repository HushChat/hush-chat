package com.platform.software.common.constants;

public class Constants {
    public static final String X_TENANT_HEADER = "X-Tenant";
    public static final String DEFAULT_TEST_TENANT_ID = "localhost";
    public static final String EMAIL_ATTR = "email";
    public static final String X_SECRET_KEY = "X-Secret-Key";
    public static final String X_PLATFORM_ID_HEADER = "X-Platform-Id";
    public static final String PREFERRED_USERNAME_ATTR = "preferred_username";
    public static final String COGNITO_CUSTOM_USER_TYPE_KEY = "custom:user_type";
    public static final String COGNITO_CUSTOM_TENANT_KEY = "custom:tenant";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String APPLICATION_JSON_CONTENT_TYPE = "application/json";
    public static final String TIME_ZONE_IST = "Asia/Kolkata";
    public static final String MAIN_SERVICE_PRODUCTION_PROFILE_NAME = "prod";
    public static final String MAIN_SERVICE_DEV_PROFILE_NAME = "local";
    public static final String MAIN_SERVICE_E2E_PROFILE_NAME = "e2e";
    public static final String MAIN_SERVICE_STAGING_PROFILE_NAME = "staging";
    public static final String MAIN_SERVICE_PENTEST_PROFILE_NAME = "pentest";
    public static final String API_REQUEST_ID = "x-uuid";
    public static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$";
    public static final String JWT_CLAIM_EMAIL = "email";

}