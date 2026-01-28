package com.platform.software.chat.user.activitystatus.dto;

public record ActivityStatusEvent(String workspaceId, String email, UserStatusEnum status, String deviceType) {
}
