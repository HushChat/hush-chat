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

package com.platform.software.common.utils;


import com.platform.software.common.constants.Constants;

import java.text.SimpleDateFormat;
import java.time.Instant;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class StringUtils {
    public static SimpleDateFormat getDateTimeFormatter() {
        return new SimpleDateFormat("yyyy-MM-dd hh:mm a");
    }

    public static String formatDateTime(Date date) {
        return getDateTimeFormatter().format(date);
    }

    /**
     * @param seconds  - provide epoch time in seconds
     * @return human-readable date string
     */
    public static String convertEpochToDateTime(Long seconds) {
        return getDateTimeFormatter().format(Date.from(Instant.ofEpochMilli(seconds) // converting to milliseconds
            .atZone(ZoneId.of(Constants.TIME_ZONE_IST)).toInstant()));
    }

    public static boolean isNotEmptyStr(String value) {
        return (value != null && !value.trim().equals(""));
    }

    public static boolean isEmpty(String value) {
        return (null == value || value.trim().equals(""));
    }

    public static boolean isValidEmail(String email) {
        Pattern pattern = Pattern.compile(Constants.EMAIL_REGEX, Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(email);   
        boolean result = matcher.matches(); 
        return result;
    }

    public static String titleCase(String sentence) {
        if (sentence == null || sentence.isEmpty()) {
            return "";
        }

        String finalSentence;
        List<String> words = new ArrayList<>();

        for (String word : sentence.split("[-\\s_]+")) { // Split string on whitespace OR hyphen Or underscore only
            String titleCaseWord = word.substring(0, 1).toUpperCase();
            if (word.length() > 1) {
                titleCaseWord += word.substring(1).toLowerCase();
            }
            words.add(titleCaseWord);
        }

        finalSentence = String.join(" ", words);
        return finalSentence;
    }

    public static String convertCamelCaseToTitleCase(String camelCase) {
        if (StringUtils.isEmpty(camelCase)) {
            return camelCase;
        }

        String withSpaces = camelCase.replaceAll("([a-z])([A-Z])", "$1 $2"); // insert spaces before uppercase letters
        return StringUtils.titleCase(withSpaces);
    }

    public static String convertEnumToSentenceCase(String enumName) {
        if (enumName == null || enumName.isBlank()) {
            return "";
        }

        String[] words = enumName.toLowerCase().split("_+");
        StringBuilder result = new StringBuilder();

        for (String word : words) {
            if (word.isEmpty())
                continue;

            if (result.isEmpty()) {
                result.append(word.substring(0, 1).toUpperCase(Locale.ROOT))
                        .append(word.substring(1));
            } else {
                result.append(" ").append(word);
            }
        }

        return result.toString();
    }
}

