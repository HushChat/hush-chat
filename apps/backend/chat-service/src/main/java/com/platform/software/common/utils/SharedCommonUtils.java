package com.platform.software.common.utils;


import com.google.common.io.Resources;

import java.io.IOException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

public class SharedCommonUtils {
    private static final DateTimeFormatter ISO_FORMATTER = DateTimeFormatter.ISO_INSTANT;

    public static String getFileContents(String resourcePath) throws IOException {
        URL url = SharedCommonUtils.class.getClassLoader().getResource(resourcePath);
        return Resources.toString(url, StandardCharsets.UTF_8);
    }


}