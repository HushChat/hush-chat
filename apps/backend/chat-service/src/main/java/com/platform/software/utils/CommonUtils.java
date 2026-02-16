package com.platform.software.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Instant;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import java.time.ZonedDateTime;
import java.util.Date;

import org.springframework.stereotype.Service;

@Service
public class CommonUtils {
    static Logger logger = LoggerFactory.getLogger(CommonUtils.class);


    public static long getCurrentTimeInSeconds() {
        return Instant.now().toEpochMilli() / 1000L;
    }

   
    public static boolean isNotEmptyObj(Object value) {
        return (value != null && !value.toString().trim().isEmpty());
    }

    public static boolean isEmptyObj(Object value) {
        return (null == value );
    }

    public static boolean isMessageVisible(Date messageCreatedAt, ZonedDateTime lastDeletedTime) {
        if (messageCreatedAt == null) {
            return false;
        }

        if (lastDeletedTime == null) {
            return true;
        }

        Date deletedAt = Date.from(lastDeletedTime.toInstant());

        return !messageCreatedAt.before(deletedAt);
    }

    private static final Pattern URL_PATTERN = Pattern.compile("(https?://\\S+)");

    public static String extractUrl(String text) {
        if (text == null || text.isEmpty()) {
            return null;
        }
        Matcher matcher = URL_PATTERN.matcher(text);
        if (matcher.find()) {
            return matcher.group();
        }
        return null;
    }
}