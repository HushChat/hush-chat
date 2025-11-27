package com.platform.software.chat.notification.service;

import com.google.firebase.messaging.BatchResponse;
import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.MulticastMessage;
import com.google.firebase.messaging.Notification;
import com.platform.software.chat.notification.dto.NotificationRequestDTO;
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
                    .addAllTokens(request.tokens())
                    .setNotification(Notification.builder()
                            .setTitle(request.title())
                            .setBody(request.body())
                            .build());

            if (request.data() != null && !request.data().isEmpty()) {
                messageBuilder.putAllData(request.data());
            }

            MulticastMessage message = messageBuilder.build();
            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            
            if(response != null){
                logger.info("Notification sent: {} succeeded, {} failed", response.getSuccessCount(), response.getFailureCount());
            }
        } catch (Exception e) {
            logger.error("Firebase notification sending failed!", e);
        }
    }

    @Override
    public boolean supports(String token) {
        return token != null && !token.startsWith("ExponentPushToken[");
    }
}
