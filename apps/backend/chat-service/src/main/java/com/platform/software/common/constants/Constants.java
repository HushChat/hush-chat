package com.platform.software.common.constants;

import java.util.Set;

public class Constants {
    public static final String X_TENANT_HEADER = "X-Tenant";
    public static final String DEFAULT_TEST_TENANT_ID = "localhost";
    public static final String EMAIL_ATTR = "email";
    public static final String X_PUBLIC_KEY = "X-Public-Key";
    public static final String X_FORWARDED_FOR_HEADER = "X-Forwarded-For";
    public static final String X_PLATFORM_ID_HEADER = "X-Platform-Id";
    public static final String PREFERRED_USERNAME_ATTR = "preferred_username";
    public static final String COGNITO_CUSTOM_USER_TYPE_KEY = "custom:user_type";
    public static final String COGNITO_CUSTOM_TENANT_KEY = "custom:tenant";
    public static final String BEARER_PREFIX = "Bearer ";
    public static final String AUTHORIZATION_HEADER = "Authorization";
    public static final String APPLICATION_JSON_CONTENT_TYPE = "application/json";
    public static final String TIME_ZONE_IST = "Asia/Kolkata";
    public static final String MAIN_SERVICE_PRODUCTION_PROFILE_NAME = "prod";
    public static final String LOCAL_PROFILE_NAME = "local";
    public static final String MAIN_SERVICE_STAGING_PROFILE_NAME = "staging";
    public static final String MAIN_SERVICE_PENTEST_PROFILE_NAME = "pentest";
    public static final String API_REQUEST_ID = "x-Uuid";
    public static final String EMAIL_REGEX = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$";
    public static final String JWT_CLAIM_EMAIL = "email";
    public static final String MENTION_ALL = "@all";

    public static final Set<String> IMAGE_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "svg");

    public static final Set<String> VIDEO_EXTENSIONS = Set.of(
            "mp4", "avi", "mov", "wmv");

    public static final Set<String> AUDIO_EXTENSIONS = Set.of(
            "mp3", "wav");
    
    public static final Set<String> DOCUMENT_EXTENSIONS = Set.of(
            "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
            "txt", "csv");

    public static final String API_KEY_USER = "api-key-user";
}