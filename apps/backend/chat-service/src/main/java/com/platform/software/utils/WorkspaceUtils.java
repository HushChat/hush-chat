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

import com.platform.software.config.workspace.WorkspaceContext;
import org.springframework.beans.factory.annotation.Value;

import java.util.function.Supplier;

public class WorkspaceUtils {

    @Value("${spring.datasource.global.schema}")
    private static String globalSchema;

    public static <T> T runInGlobalSchema(Supplier<T> action) {
        String oldTenant = WorkspaceContext.getCurrentWorkspace();
        try {
            WorkspaceContext.setCurrentWorkspace(globalSchema);
            return action.get();
        } finally {
            WorkspaceContext.setCurrentWorkspace(oldTenant);
        }
    }

    public static void runInGlobalSchema(Runnable action) {
        runInGlobalSchema(() -> {
            action.run();
            return null;
        });
    }
}
