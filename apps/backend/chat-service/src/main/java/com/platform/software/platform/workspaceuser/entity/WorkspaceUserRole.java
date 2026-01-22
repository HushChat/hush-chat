package com.platform.software.platform.workspaceuser.entity;

public enum WorkspaceUserRole {
    ADMIN("ADMIN"),
    MEMBER("MEMBER");

    private final String name;

    WorkspaceUserRole(String name) {
        this.name = name;
    }

    public String getName() {
        return name;
    }
}