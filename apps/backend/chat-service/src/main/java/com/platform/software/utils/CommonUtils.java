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