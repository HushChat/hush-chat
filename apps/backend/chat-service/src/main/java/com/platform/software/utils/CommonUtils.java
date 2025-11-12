package com.platform.software.utils;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Instant;
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
}