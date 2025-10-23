package com.platform.software.chat.notification.service;

import com.platform.software.chat.notification.dto.NotificationRequestDTO;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;


public interface NotificationService {
    void sendNotification(NotificationRequestDTO request);
    boolean supports(String token);
}
