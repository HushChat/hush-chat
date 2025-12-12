package com.platform.software.utils;

import java.util.Arrays;
import java.util.stream.Collectors;

public class SearchUtil {

    public static String formatSearchQuery(String keyword) {
        if (keyword == null || keyword.isBlank()) {
            return null;
        }

        String sanitized = keyword.replaceAll("[^a-zA-Z0-9\\s]", " ").trim();
        if (sanitized.isEmpty()) return null;

        return Arrays.stream(sanitized.split("\\s+"))
                .filter(word -> !word.isBlank())
                .map(word -> word + ":*")
                .collect(Collectors.joining(" & "));
    }
}
