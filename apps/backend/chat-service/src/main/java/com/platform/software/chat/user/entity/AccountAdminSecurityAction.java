package com.platform.software.chat.user.entity;

// TODO: replace this with shared enum
/**
 * this enum will be used as admin security action
 */
public enum AccountAdminSecurityAction {
    FORCE_LOGOUT("Admin forced logout", "Your session was terminated by an administrator"),
    ACCOUNT_INACTIVE("Account deactivated", "Your account has been deactivated"),
    PASSWORD_CHANGED("Password changed", "Your password was changed. Please login again");

    private final String action;
    private final String userMessage;

    AccountAdminSecurityAction(String action, String userMessage) {
        this.action = action;
        this.userMessage = userMessage;
    }

    public String getAction() {
        return action;
    }

    public String getUserMessage() {
        return userMessage;
    }
}
