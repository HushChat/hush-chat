/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
            MulticastMessage message = MulticastMessage.builder()
                    .addAllTokens(request.tokens())
                    .setNotification(Notification.builder()
                            .setTitle(request.title())
                            .setBody(request.body())
                            .build())
                    .build();

            BatchResponse response = FirebaseMessaging.getInstance().sendEachForMulticast(message);
            if(response!= null){
                logger.info("Notification sent: {} succeeded, {} failed", response.getSuccessCount(), response.getFailureCount());
            }
        } catch (Exception e) {
            logger.error("Firebase initialization failed!",e);
        }
    }

    @Override
    public boolean supports(String token) {
        return token != null && !token.startsWith("ExponentPushToken[");
    }
}
