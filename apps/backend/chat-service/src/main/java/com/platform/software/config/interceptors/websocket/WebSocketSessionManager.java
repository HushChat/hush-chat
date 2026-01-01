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
import java.util.stream.Collectors;

@Service
public class WebSocketSessionManager {
    private final Logger logger = LoggerFactory.getLogger(WebSocketSessionManager.class);
    private final UserService userService;

    // Session key format: workspaceId:email -> ex: localhost:test@gmail.com
    @Getter
    private final Map<String, WebSocketSessionInfoDAO> webSocketSessionInfos = new ConcurrentHashMap<>();

    private final SimpMessagingTemplate template;
    private final UserActivityStatusWSService userActivityStatusWSService;

    public WebSocketSessionManager(
            SimpMessagingTemplate template,
            UserActivityStatusWSService userActivityStatusWSService,
            UserService userService
    ) {
        this.template = template;
        this.userActivityStatusWSService = userActivityStatusWSService;
        this.userService = userService;
    }

    /**
     * Register session using STOMP header accessor (new method for ChannelInterceptor)
     */
    public void registerSessionFromStomp(String sessionKey, StompHeaderAccessor accessor, String workspaceId, String email, String deviceType, UserStatusEnum userStatus) {
        DeviceType device = DeviceType.fromString(deviceType);

        WebSocketSessionInfoDAO webSocketSessionInfoDAO = WebSocketSessionInfoDAO.builder()
                .stompSessionId(accessor.getSessionId())
                .wsSessionId(sessionKey)
                .sessionAttributes(new HashMap<>(accessor.getSessionAttributes()))
                .deviceType(device)
                .chatUserStatus(userStatus)
                .connectedTime(ZonedDateTime.now())
                .createdTime(ZonedDateTime.now())
                .disconnectedTime(null)
                .build();

        webSocketSessionInfos.put(sessionKey, webSocketSessionInfoDAO);

        UserStatusEnum normalizedStatus = normalizeStatus(userStatus);
        userActivityStatusWSService.invokeUserIsActive(workspaceId, email, webSocketSessionInfos, normalizedStatus, deviceType);
        logger.info("registered stomp session for user: {}", sessionKey);
    }

    /**
     * re connecting session using STOMP header accessor (new method for ChannelInterceptor)
     */
    public void reconnectingSessionFromStomp(String sessionKey, String workspaceId, String email, String deviceType, UserStatusEnum userStatus) {
        Optional<WebSocketSessionInfoDAO> session = getValidSession(sessionKey);
        if (session.isPresent()) {
            WebSocketSessionInfoDAO existingSession = session.get();

            String device = existingSession.getDeviceType().getName();
            if (deviceType != null) {
                device = deviceType;
            }

            existingSession.setDeviceType(DeviceType.fromString(device));
            existingSession.setDisconnectedTime(null);
            existingSession.setChatUserStatus(userStatus);
            webSocketSessionInfos.put(sessionKey, existingSession);

            UserStatusEnum normalizedStatus = normalizeStatus(userStatus);
            userActivityStatusWSService.invokeUserIsActive(workspaceId, email, webSocketSessionInfos, normalizedStatus, device);

            logger.debug("session re connected for user: {}", sessionKey);
        }
    }

    public void subscribeUserActivityStatues(UserActivityWSSubscriptionData subscriptionData) {
        String sessionKey = getSessionKey(subscriptionData.getWorkspaceId(), subscriptionData.getEmail(), subscriptionData.getDeviceId());
        Optional<WebSocketSessionInfoDAO> session = getValidSession(sessionKey);
        if (session.isPresent()) {
            WebSocketSessionInfoDAO existingSession = session.get();

            WorkspaceContext.setCurrentWorkspace(subscriptionData.getWorkspaceId());
            String userStatusString = userService.getUserAvailabilityStatus(subscriptionData.getEmail());
            UserStatusEnum userStatusEnum = UserStatusEnum.fromString(userStatusString);

            if (subscriptionData.getVisibleConversations() != null) {
                existingSession.setVisibleConversations(subscriptionData.getVisibleConversations());
            }

            DeviceType device = existingSession.getDeviceType();
            if (subscriptionData.getDeviceType() != null) {
                device = DeviceType.fromString(subscriptionData.getDeviceType());
            }

            existingSession.setOpenedConversation(subscriptionData.getOpenedConversation());
            existingSession.setDisconnectedTime(null);
            existingSession.setDeviceType(device);

            if (userStatusEnum.equals(UserStatusEnum.BUSY)) {
                existingSession.setChatUserStatus(userStatusEnum);
            } else {
                existingSession.setChatUserStatus(UserStatusEnum.ONLINE);
            }


            webSocketSessionInfos.put(sessionKey, existingSession);
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

    public void removeWebSocketSessionInfo(String sessionKey, String email, String deviceType) {
        WebSocketSessionInfoDAO removed = webSocketSessionInfos.remove(sessionKey);
        if (removed != null) {
            String workspaceId = sessionKey.split(":", 2)[0];

            List<WebSocketSessionInfoDAO> sessions = getSessionsForUser(workspaceId, email);
            if(sessions == null || sessions.isEmpty()) {
                logger.debug("no active sessions remain for user: {}", sessionKey);
                userActivityStatusWSService.invokeUserIsActive(workspaceId, email, webSocketSessionInfos, UserStatusEnum.OFFLINE, deviceType);
            }
            logger.debug("removed session for user: {}", sessionKey);
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
                String sessionKey = entry.getKey();
                if (!sessionKey.isEmpty()) {
                    template.convertAndSendToUser(sessionKey, path, payload);
                }
            } catch (Exception e) {
                logger.warn("failed to send message to user with key: {}", entry.getKey(), e);
            }
        }
    }

    /**
     * Send message to a specific user using encoded email
     */
    public void sendMessageToUser(String sessionKey, String path, Object payload) {
        try {
            template.convertAndSendToUser(sessionKey ,path, payload);
        } catch (Exception e) {
            logger.warn("failed to send message to user", e);
        }
    }

    /**
     * Send message to a specific user by tenant ID and email
     */
    public void sendMessageToUser(String workspaceId, String email, String path, Object payload) {
        try {
            String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);

            List<WebSocketSessionInfoDAO> sessions = getSessionsForUser(workspaceId, email);

            if (!sessions.isEmpty()) {
                for (WebSocketSessionInfoDAO sessionInfo : sessions) {
                    template.convertAndSendToUser(sessionInfo.getWsSessionId(), path, payload);
                    logger.debug("message sent to user: {} at path: {}", email, path + encodedEmail);
                }
            } else {
                logger.debug("no active session found for user {} in workspace {}", email, workspaceId);
            }

        } catch (Exception e) {
            logger.warn("failed to send message to user {} at tenant {}", email, workspaceId, e);
        }
    }

    /**
     * Get all ws sessions for a specific user in a workspace
     */
    public List<WebSocketSessionInfoDAO> getSessionsForUser(
            String workspaceId,
            String email
    ) {
        String keyPrefix = String.format("%s:%s:", workspaceId, URLEncoder.encode(email, StandardCharsets.UTF_8));

        return webSocketSessionInfos.entrySet()
                .stream()
                .filter(entry -> entry.getKey().startsWith(keyPrefix))
                .map(Map.Entry::getValue)
                .collect(Collectors.toList());
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

    private String getSessionKey(String tenantId, String email, String deviceId) {
        return String.format("%s:%s:%s", tenantId, URLEncoder.encode(email, StandardCharsets.UTF_8), deviceId);
    }

    public boolean isUserConnected(String workspaceId, String email) {
        List<WebSocketSessionInfoDAO> sessions = getSessionsForUser(workspaceId, email);
        return sessions != null && !sessions.isEmpty();
    }

    public ChatUserStatus getUserChatStatus(String workspaceId, String email) {
        String webSocketStoreKey = getSessionKey(workspaceId, email);
        WebSocketSessionInfoDAO sessionInfo = webSocketSessionInfos.get(webSocketStoreKey);

        if (sessionInfo == null) {
            return ChatUserStatus.OFFLINE;
        }

        if (UserStatusEnum.BUSY.equals(sessionInfo.getChatUserStatus())) {
            return ChatUserStatus.BUSY;
        }

        return ChatUserStatus.ONLINE;
    }

    /**
     * Retrieves the device type for a user's active WebSocket session in a workspace.
     *
     * @param workspaceId the unique identifier of the workspace
     * @param email the email address of the user
     * @return the {@link DeviceType} of the user's active session, or {@code null} if no active
     *         session exists for the specified workspace and email combination
     * @see WebSocketSessionInfoDAO#getDeviceType()
     */
    public DeviceType getUserDeviceType(String workspaceId, String email) {
        List<WebSocketSessionInfoDAO> sessions = getSessionsForUser(workspaceId, email);

        if (sessions != null && !sessions.isEmpty()) {
            return sessions.getLast().getDeviceType();
        }
        return null;
    }

    /**
     * Normalizes the user status: Only BUSY and ONLINE are treated as active statuses.
     * If the status is not BUSY, it defaults to ONLINE, since this use in register and reconnecting session
     */
    private UserStatusEnum normalizeStatus(UserStatusEnum status) {
        return UserStatusEnum.BUSY.equals(status) ? UserStatusEnum.BUSY : UserStatusEnum.ONLINE;
    }
}