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

import com.platform.software.chat.notification.dto.NotificationRequestDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Component
public class NotificationServiceFactory {

    private static final Logger logger = LoggerFactory.getLogger(NotificationServiceFactory.class);

    private final List<NotificationService> notificationServices;

    public NotificationServiceFactory(List<NotificationService> notificationServices) {
        this.notificationServices = notificationServices;
    }

    /**
     * Sends notifications by grouping tokens by their supported service
     * @param request The notification request containing tokens, title, and body
     */
    public void sendNotification(NotificationRequestDTO request) {
        Map<NotificationService, List<String>> serviceTokenMap = groupTokensByService(request.tokens());

        for (Map.Entry<NotificationService, List<String>> entry : serviceTokenMap.entrySet()) {
            NotificationService service = entry.getKey();
            List<String> tokens = entry.getValue();

            if (!tokens.isEmpty()) {
                NotificationRequestDTO serviceRequest = new NotificationRequestDTO(
                        tokens,
                        request.title(),
                        request.body()
                );

                try {
                    service.sendNotification(serviceRequest);
                    logger.info("Sent {} notifications via {}", tokens.size(), service.getClass().getSimpleName());
                } catch (Exception e) {
                    logger.error("Failed to send notifications via {}", service.getClass().getSimpleName(), e);
                }
            }
        }
    }

    /**
     * Gets the appropriate notification service for a single token
     * @param token The push notification token
     * @return The matching NotificationService or null if none found
     */
    public NotificationService getServiceForToken(String token) {
        return notificationServices.stream()
                .filter(service -> service.supports(token))
                .findFirst()
                .orElse(null);
    }

    /**
     * Groups tokens by their supported notification service
     * @param tokens List of push notification tokens
     * @return Map of NotificationService to their supported tokens
     */
    private Map<NotificationService, List<String>> groupTokensByService(List<String> tokens) {
        Map<NotificationService, List<String>> serviceTokenMap = new HashMap<>();

        for (String token : tokens) {
            NotificationService service = getServiceForToken(token);

            if (service != null) {
                serviceTokenMap.computeIfAbsent(service, k -> new ArrayList<>()).add(token);
            } else {
                logger.warn("No notification service found for token: {}", token);
            }
        }

        return serviceTokenMap;
    }
}