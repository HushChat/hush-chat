package com.platform.software.chat.user.activitystatus.dto;

import com.platform.software.chat.notification.entity.DeviceType;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class UserActivityInfo {
    private String workspace;
    private String email;
    private UserStatusEnum status;
    private DeviceType deviceType;
    private long lastUpdated;

    public UserActivityInfo(String workspace, String email, UserStatusEnum status, DeviceType deviceType) {
        this.workspace = workspace;
        this.email = email;
        this.status = status;
        this.deviceType = deviceType;
        this.lastUpdated = System.currentTimeMillis();
    }
}
