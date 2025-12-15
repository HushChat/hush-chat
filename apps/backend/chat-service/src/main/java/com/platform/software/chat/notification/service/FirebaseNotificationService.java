package com.platform.software.chat.notification.service;

import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.MulticastMessage;
import com.platform.software.chat.notification.dto.NotificationRequestDTO;

import java.util.HashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class FirebaseNotificationService implements NotificationService{

    private static final Logger logger = LoggerFactory.getLogger(FirebaseNotificationService.class);

    @Override
    @Async
    public void sendNotification(NotificationRequestDTO request) {
        try {
            MulticastMessage.Builder messageBuilder = MulticastMessage.builder()
                    .addAllTokens(request.tokens());                

            Map<String, String> dataMap = new HashMap<>();
            if (request.data() != null) {
                dataMap.putAll(request.data());
            }

            dataMap.put("title", request.title());
            dataMap.put("body", request.body());
            messageBuilder.putAllData(dataMap);

            MulticastMessage message = messageBuilder.build();
            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            
            if(response != null){
                logger.info("notification sent: {} succeeded, {} failed", response.getSuccessCount(), response.getFailureCount());
            }
        } catch (Exception e) {
            logger.error("firebase notification sending failed!", e);
        }
    }

    @Override
    public boolean supports(String token) {
        return token != null && !token.startsWith("ExponentPushToken[");
    }
}
