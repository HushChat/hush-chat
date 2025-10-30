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

package com.platform.software.config.workspace;

/** This class manages the current workspace context using a ThreadLocal variable.
 * It allows setting, getting, and clearing the current workspace identifier.
 * The use of InheritableThreadLocal allows child threads to inherit the value from the parent thread.
 */
public class WorkspaceContext {
    private static final ThreadLocal<String> currentWorkspace = new InheritableThreadLocal<>();

    public static String getCurrentWorkspace() {
        return currentWorkspace.get();
    }

    public static void setCurrentWorkspace(String tenant) {
        currentWorkspace.set(tenant);
    }

    public static void clear() {
        currentWorkspace.remove();
    }
}