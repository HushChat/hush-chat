package com.platform.software.config.workspace;

/**
 * This class manages the current workspace context using a ThreadLocal variable.
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