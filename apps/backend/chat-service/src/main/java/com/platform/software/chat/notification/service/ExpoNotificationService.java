package com.platform.software.chat.notification.service;

import com.platform.software.chat.notification.dto.NotificationRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import org.springframework.http.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpoNotificationService implements NotificationService{

    private static final String EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

    private final RestTemplate restTemplate;
    private static final Logger logger = LoggerFactory.getLogger(ExpoNotificationService.class);

    public ExpoNotificationService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    @Override
    @Async
    public void sendNotification(NotificationRequestDTO request) {
        List<Map<String, Object>> messages = new ArrayList<>();

        for (String token : request.tokens()) {
            Map<String, Object> message = new HashMap<>();
            message.put("to", token);
            message.put("sound", "default");
            message.put("title", request.title());
            message.put("body", request.body());
            message.put("priority", "high");

            if (request.data() != null && !request.data().isEmpty()) {
                message.put("data", request.data());
            }
            
            messages.add(message);
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<List<Map<String, Object>>> requests = new HttpEntity<>(messages, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(EXPO_PUSH_URL, requests, String.class);
            logger.info("Expo response: {}", response.getBody());
        } catch (Exception e) {
            logger.error("Expo notification sending failed!", e);
        }
    }

    @Override
    public boolean supports(String token) {
        return token != null && token.startsWith("ExponentPushToken[");
    }
}
