package com.platform.software.config.interceptors.websocket;

import com.platform.software.common.constants.GeneralConstants;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WebSocketSessionManager {
    private final Logger logger = LoggerFactory.getLogger(WebSocketSessionManager.class);

    // Session key format: tenantId:email -> ex: localhost:test@gmail.com
    @Getter
    private final Map<String, WebSocketSessionInfoDAO> webSocketSessionInfos = new ConcurrentHashMap<>();

    private final SimpMessagingTemplate template;

    public WebSocketSessionManager(SimpMessagingTemplate template) {
        this.template = template;
    }

    /**
     * Register session using STOMP header accessor (new method for ChannelInterceptor)
     */
    public void registerSessionFromStomp(String userId, StompHeaderAccessor accessor) {
        WebSocketSessionInfoDAO webSocketSessionInfoDAO = WebSocketSessionInfoDAO.builder()
            .stompSessionId(accessor.getSessionId())
            .sessionAttributes(new HashMap<>(accessor.getSessionAttributes()))
            .connectedTime(ZonedDateTime.now())
            .createdTime(ZonedDateTime.now())
            .build();

        webSocketSessionInfos.put(userId, webSocketSessionInfoDAO);
        logger.info("registered stomp session for user: {}", userId);
    }

    public Optional<WebSocketSessionInfoDAO> getValidSession(String sessionKey) {
        WebSocketSessionInfoDAO existingSession = webSocketSessionInfos.get(sessionKey);
        if (existingSession == null) {
            return Optional.empty();
        }

        // For STOMP sessions, check if session attributes are valid
        if (existingSession.getStompSessionId() != null) {
            // STOMP session validation - check if session attributes contain required data
            Map<String, Object> attributes = existingSession.getSessionAttributes();
            if (attributes != null && attributes.containsKey(GeneralConstants.USER_ID_ATTR)) {
                return Optional.of(existingSession);
            }
        }

        return Optional.empty();
    }

    public void removeWebSocketSessionInfo(String userId) {
        WebSocketSessionInfoDAO removed = webSocketSessionInfos.remove(userId);
        if (removed != null) {
            logger.debug("removed session for user: {}", userId);
        }
    }

    public WebSocketSessionInfoDAO getWebSocketSessionInfo(String userId) {
        return webSocketSessionInfos.get(userId);
    }

    public Set<String> getActiveSessionKeys() {
        return webSocketSessionInfos.keySet();
    }

    /**
     * Send a broadcasting message to every logged-in user
     */
    public void sendMessageToEveryConnectedUser(String path, Object payload) {
        for (Map.Entry<String, WebSocketSessionInfoDAO> entry : webSocketSessionInfos.entrySet()) {
            try {
                String[] tenantIdEmail = entry.getKey().split(":", 2); // Split into max 2 parts
                if (tenantIdEmail.length >= 2) {
                    String encodedEmail = tenantIdEmail[1];
                    template.convertAndSend(path + encodedEmail, payload);
                }
            } catch (Exception e) {
                logger.warn("failed to send message to user with key: {}", entry.getKey(), e);
            }
        }
    }

    /**
     * Send message to a specific user using encoded email
     */
    public void sendMessageToUser(String encodedEmail, String path, Object payload) {
        try {
            template.convertAndSend(path + encodedEmail, payload);
        } catch (Exception e) {
            logger.warn("failed to send message to user", e);
        }
    }

    /**
     * Send message to a specific user by tenant ID and email
     */
    public void sendMessageToUser(String tenantId, String email, String path, Object payload) {
        String webSocketStoreKey = String.format("%s:%s", tenantId, URLEncoder.encode(email, StandardCharsets.UTF_8));
        WebSocketSessionInfoDAO webSocketSessionInfoDAO = webSocketSessionInfos.get(webSocketStoreKey);

        if (webSocketSessionInfoDAO != null) {
            try {
                String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
                template.convertAndSend(path + encodedEmail, payload);
                logger.debug("message sent to user: {} at path: {}", email, path + encodedEmail);
            } catch (Exception e) {
                logger.warn("failed to send message at tenant: {}", tenantId, e);
            }
        } else {
            logger.debug("no active session found at tenant: {}", tenantId);
        }
    }

    /**
     * Get session information by STOMP session ID
     */
    public Optional<WebSocketSessionInfoDAO> getSessionByStompId(String stompSessionId) {
        return webSocketSessionInfos.values().stream()
            .filter(session -> stompSessionId.equals(session.getStompSessionId()))
            .findFirst();
    }

    /**
     * Remove session by STOMP session ID
     */
    public void removeSessionByStompId(String stompSessionId) {
        webSocketSessionInfos.entrySet().removeIf(entry ->
            stompSessionId.equals(entry.getValue().getStompSessionId()));
        logger.debug("removed session with stomp id: {}", stompSessionId);
    }

    /**
     * Get count of active sessions
     */
    public int getActiveSessionCount() {
        return webSocketSessionInfos.size();
    }

    /**
     * Get all sessions for a specific tenant
     */
    public Map<String, WebSocketSessionInfoDAO> getSessionsByTenant(String tenantId) {
        Map<String, WebSocketSessionInfoDAO> tenantSessions = new HashMap<>();

        webSocketSessionInfos.entrySet().stream()
            .filter(entry -> entry.getKey().startsWith(tenantId + ":"))
            .forEach(entry -> tenantSessions.put(entry.getKey(), entry.getValue()));

        return tenantSessions;
    }

    /**
     * Clean up expired or invalid sessions
     */
    public void cleanupInvalidSessions() {
        List<String> keysToRemove = new ArrayList<>();

        for (Map.Entry<String, WebSocketSessionInfoDAO> entry : webSocketSessionInfos.entrySet()) {
            if (!getValidSession(entry.getKey()).isPresent()) {
                keysToRemove.add(entry.getKey());
            }
        }

        keysToRemove.forEach(this::removeWebSocketSessionInfo);

        if (!keysToRemove.isEmpty()) {
            logger.info("cleaned up {} invalid sessions", keysToRemove.size());
        }
    }
}