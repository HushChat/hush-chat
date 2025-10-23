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
