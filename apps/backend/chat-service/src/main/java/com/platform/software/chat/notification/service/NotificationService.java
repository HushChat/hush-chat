package com.platform.software.chat.notification.service;

import com.platform.software.chat.notification.dto.NotificationRequestDTO;


public interface NotificationService {
    void sendNotification(NotificationRequestDTO request);

    boolean supports(String token);
}
