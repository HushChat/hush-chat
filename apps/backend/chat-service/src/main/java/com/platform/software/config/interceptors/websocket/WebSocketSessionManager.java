package com.platform.software.config.interceptors.websocket;

import com.platform.software.chat.notification.entity.DeviceType;
import com.platform.software.chat.user.activitystatus.UserActivityStatusWSService;
import com.platform.software.chat.user.activitystatus.dto.UserActivityWSSubscriptionData;
import com.platform.software.chat.user.activitystatus.dto.UserStatusEnum;
import com.platform.software.chat.user.entity.ChatUserStatus;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.common.constants.GeneralConstants;
import com.platform.software.config.workspace.WorkspaceContext;
import lombok.Getter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class WebSocketSessionManager {
    private final Logger logger = LoggerFactory.getLogger(WebSocketSessionManager.class);
    private final UserService userService;

    // Session key format: workspaceId:email -> ex: localhost:test@gmail.com
    @Getter
    private final Map<String, WebSocketSessionInfoDAO> webSocketSessionInfos = new ConcurrentHashMap<>();

    private final SimpMessagingTemplate template;
    private final UserActivityStatusWSService userActivityStatusWSService;

    public WebSocketSessionManager(SimpMessagingTemplate template, UserActivityStatusWSService userActivityStatusWSService, UserService userService) {
        this.template = template;
        this.userActivityStatusWSService = userActivityStatusWSService;
        this.userService = userService;
    }

    /**
     * Register session using STOMP header accessor (new method for ChannelInterceptor)
     */
    public void registerSessionFromStomp(String userId, StompHeaderAccessor accessor, String workspaceId, String email, String deviceType, UserStatusEnum userStatus) {
        DeviceType device = DeviceType.fromString(deviceType);

        WebSocketSessionInfoDAO webSocketSessionInfoDAO = WebSocketSessionInfoDAO.builder()
                .stompSessionId(accessor.getSessionId())
                .sessionAttributes(new HashMap<>(accessor.getSessionAttributes()))
                .deviceType(device)
                .availabilityStatus(userStatus)
                .connectedTime(ZonedDateTime.now())
                .createdTime(ZonedDateTime.now())
                .disconnectedTime(null)
                .build();

        webSocketSessionInfos.put(userId, webSocketSessionInfoDAO);

        if (UserStatusEnum.BUSY.equals(userStatus)) {
            userActivityStatusWSService.invokeUserIsActive(workspaceId, email, webSocketSessionInfos, userStatus, deviceType);
        } else {
            userActivityStatusWSService.invokeUserIsActive(workspaceId, email, webSocketSessionInfos, UserStatusEnum.ONLINE, deviceType);
        }


        logger.info("registered stomp session for user: {}", userId);
    }

    /**
     * re connecting session using STOMP header accessor (new method for ChannelInterceptor)
     */
    public void reconnectingSessionFromStomp(String userId, String workspaceId, String email, String deviceType) {
        Optional<WebSocketSessionInfoDAO> session = getValidSession(userId);
        if (session.isPresent()) {
            WebSocketSessionInfoDAO existingSession = session.get();

            existingSession.setDisconnectedTime(null);
            webSocketSessionInfos.put(userId, existingSession);

            userActivityStatusWSService.invokeUserIsActive(workspaceId, email, webSocketSessionInfos, existingSession.getAvailabilityStatus(), deviceType);
            logger.debug("session re connected for user: {}", userId);
        }
    }

    public void subscribeUserActivityStatues(UserActivityWSSubscriptionData subscriptionData) {
        String userId = getSessionKey(subscriptionData.getWorkspaceId(), subscriptionData.getEmail());
        Optional<WebSocketSessionInfoDAO> session = getValidSession(userId);
        if (session.isPresent()) {
            WebSocketSessionInfoDAO existingSession = session.get();

            WorkspaceContext.setCurrentWorkspace(subscriptionData.getWorkspaceId());
            String userStatusString = userService.getUserAvailabilityStatus(subscriptionData.getEmail());
            UserStatusEnum userStatusEnum = UserStatusEnum.fromString(userStatusString);

            if (subscriptionData.getVisibleConversations() != null) {
                existingSession.setVisibleConversations(subscriptionData.getVisibleConversations());
            }

            DeviceType device = DeviceType.fromString(subscriptionData.getDeviceType());

            existingSession.setOpenedConversation(subscriptionData.getOpenedConversation());
            existingSession.setDisconnectedTime(null);
            existingSession.setDeviceType(device);

            if (userStatusEnum.equals(UserStatusEnum.BUSY)) {
                existingSession.setAvailabilityStatus(userStatusEnum);
            } else {
                existingSession.setAvailabilityStatus(UserStatusEnum.ONLINE);
            }

            webSocketSessionInfos.put(userId, existingSession);
        }
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

    public void removeWebSocketSessionInfo(String userId, String email, String deviceType) {
        WebSocketSessionInfoDAO removed = webSocketSessionInfos.remove(userId);
        if (removed != null) {
            String workspaceId = userId.split(":", 2)[0];
            userActivityStatusWSService.invokeUserIsActive(workspaceId, email, webSocketSessionInfos, UserStatusEnum.OFFLINE, deviceType);
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
                String[] workspaceIdEmail = entry.getKey().split(":", 2); // Split into max 2 parts
                if (workspaceIdEmail.length >= 2) {
                    String encodedEmail = workspaceIdEmail[1];
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
    public void sendMessageToUser(String workspaceId, String email, String path, Object payload) {
        String webSocketStoreKey = getSessionKey(workspaceId, email);
        WebSocketSessionInfoDAO webSocketSessionInfoDAO = webSocketSessionInfos.get(webSocketStoreKey);

        if (webSocketSessionInfoDAO != null) {
            try {
                String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
                template.convertAndSend(path + encodedEmail, payload);
                logger.debug("message sent to user: {} at path: {}", email, path + encodedEmail);
            } catch (Exception e) {
                logger.warn("failed to send message at tenant: {}", workspaceId, e);
            }
        } else {
            logger.debug("no active session found at tenant: {}", workspaceId);
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
    public Map<String, WebSocketSessionInfoDAO> getSessionsByTenant(String workspaceId) {
        Map<String, WebSocketSessionInfoDAO> tenantSessions = new HashMap<>();

        webSocketSessionInfos.entrySet().stream()
            .filter(entry -> entry.getKey().startsWith(workspaceId + ":"))
            .forEach(entry -> tenantSessions.put(entry.getKey(), entry.getValue()));

        return tenantSessions;
    }

    private static String getSessionKey(String workspaceId, String email) {
        String webSocketStoreKey = String.format("%s:%s", workspaceId, URLEncoder.encode(email, StandardCharsets.UTF_8));
        return webSocketStoreKey;
    }

    public boolean isUserConnected(String workspaceId, String email) {
        String webSocketStoreKey = getSessionKey(workspaceId, email);
        return webSocketSessionInfos.containsKey(webSocketStoreKey);
    }

    public ChatUserStatus getUserChatStatus(String workspaceId, String email) {
        String webSocketStoreKey = getSessionKey(workspaceId, email);
        WebSocketSessionInfoDAO sessionInfo = webSocketSessionInfos.get(webSocketStoreKey);

        if (sessionInfo == null) {
            return ChatUserStatus.OFFLINE;
        }

        if (UserStatusEnum.BUSY.equals(sessionInfo.getAvailabilityStatus())) {
            return ChatUserStatus.BUSY;
        }

        return ChatUserStatus.ONLINE;
    }

    public DeviceType getUserDeviceType(String workspaceId, String email) {
        String webSocketStoreKey = getSessionKey(workspaceId, email);
        WebSocketSessionInfoDAO sessionInfo = webSocketSessionInfos.get(webSocketStoreKey);

        if (sessionInfo != null) {
            return sessionInfo.getDeviceType();
        }
        return null;
    }
}