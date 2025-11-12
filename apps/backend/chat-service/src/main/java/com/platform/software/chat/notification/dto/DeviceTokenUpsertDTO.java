package com.platform.software.chat.notification.dto;

import com.platform.software.chat.notification.entity.ChatNotification;
import com.platform.software.chat.notification.entity.DeviceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DeviceTokenUpsertDTO {
    @NotBlank
    private String token;
    @NotNull
    private DeviceType platform;

    public static ChatNotification toChatNotification(DeviceTokenUpsertDTO deviceTokenUpsertDTO) {
        ChatNotification chatNotification = new ChatNotification();
        chatNotification.setToken(deviceTokenUpsertDTO.getToken());
        chatNotification.setPlatform(deviceTokenUpsertDTO.getPlatform());
        return chatNotification;
    }
}
