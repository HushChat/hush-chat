package com.platform.software.config.interceptors.websocket;

import com.auth0.jwt.JWT;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.service.UserService;
import com.platform.software.common.constants.Constants;
import com.platform.software.common.constants.GeneralConstants;
import com.platform.software.common.utils.AuthUtils;
import com.platform.software.config.aws.AWSCognitoConfig;

import com.platform.software.config.workspace.WorkspaceContext;
import com.platform.software.exception.CustomForbiddenException;
import com.platform.software.platform.workspaceuser.service.WorkspaceUserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.interfaces.RSAPublicKey;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class WebSocketAuthorizationInterceptor implements ChannelInterceptor {
    Logger logger = LoggerFactory.getLogger(WebSocketAuthorizationInterceptor.class);

    private final AWSCognitoConfig awsCognitoConfig;
    private final WebSocketSessionManager sessionManager;
    private final UserService userService;
    private final WorkspaceUserService workspaceUserService;

    private final HashMap<String, RSAPublicKey> cachedSignedPublicKeyMapFromCognito = new HashMap<>();

    public WebSocketAuthorizationInterceptor(
        WebSocketSessionManager sessionManager,
        AWSCognitoConfig awsCognitoConfig,
        UserService userService,
        WorkspaceUserService workspaceUserService
    ) {
        this.sessionManager = sessionManager;
        this.awsCognitoConfig = awsCognitoConfig;
        this.userService = userService;
        this.workspaceUserService = workspaceUserService;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            try {
                return authenticateConnection(message, accessor);
            } catch (CustomForbiddenException e) {
                logger.error("webSocket authentication failed: {}", e.getMessage());
                return null;
            } catch (Exception e) {
                logger.error("webSocket authentication failed with unexpected error: {}", e.getMessage());
                return null;
            }
        }

        return message;
    }

    private Message<?> authenticateConnection(Message<?> message, StompHeaderAccessor accessor) {
        // Get authentication token from headers
        String bearerToken = extractHeaderValue(accessor, GeneralConstants.AUTHORIZATION_HEADER);
        String workspaceId = extractHeaderValue(accessor, GeneralConstants.WORKSPACE_ID_HEADER);

        if (bearerToken == null || workspaceId == null) {
            logger.error("web socket cannot authorize: missing required parameters.");
            throw new CustomForbiddenException("Missing required authentication parameters");
        }

        String token;
        if (bearerToken.startsWith(Constants.BEARER_PREFIX)) {
            token = bearerToken.substring(Constants.BEARER_PREFIX.length());
        } else {
            throw new CustomForbiddenException("Invalid bearer token");
        }

        DecodedJWT decodedJWT;
        try {
            decodedJWT = JWT.decode(token);
        } catch (JWTDecodeException exception) {
            logger.error("failed to decode token: {}", token, exception);
            throw new CustomForbiddenException("Invalid token format");
        }

        try {
            Map<String, Claim> claims = decodedJWT.getClaims();

            String email = claims.get(Constants.JWT_CLAIM_EMAIL).asString().replace("\"", "");

            // Validate token
            RSAPublicKey publicKey = AuthUtils.getPublicKey(decodedJWT.getKeyId(), awsCognitoConfig.getJwks(), cachedSignedPublicKeyMapFromCognito);
            AuthUtils.verifyToken(publicKey, token);

            workspaceUserService.verifyUserAccessToWorkspace(email, workspaceId);
            WorkspaceContext.setCurrentWorkspace(workspaceId);
            ChatUser user = userService.getUserByEmail(email);

            String sessionKey = createSessionKey(workspaceId, email);

            // Store session information in STOMP session attributes
            accessor.getSessionAttributes().put(GeneralConstants.USER_ID_ATTR, sessionKey);
            accessor.getSessionAttributes().put(Constants.JWT_CLAIM_EMAIL, email);
            accessor.getSessionAttributes().put("workspaceId", workspaceId);

            manageSession(sessionKey, accessor, user, workspaceId, email);

            logger.info("websocket connection authenticated for workspace: {} user: {}", workspaceId, user.getId());

        } catch (Exception exception) {
            logger.error("websocket authentication failed for error: {}", exception.getMessage());
            throw new CustomForbiddenException("Web socket authentication failed");
        }

        return message;
    }

    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.DISCONNECT.equals(accessor.getCommand())) {
            handleDisconnection(accessor);
        }
    }

    private void handleDisconnection(StompHeaderAccessor accessor) {
        String sessionKey = (String) accessor.getSessionAttributes().get(GeneralConstants.USER_ID_ATTR);
        String email = (String) accessor.getSessionAttributes().get(Constants.JWT_CLAIM_EMAIL);

        if (sessionKey != null) {
            sessionManager.removeWebSocketSessionInfo(sessionKey, email);
            logger.info("removed websocket session for user: {}", email);
        }
    }

    private String createSessionKey(String tenantId, String email) {
        return String.format("%s:%s", tenantId, URLEncoder.encode(email, StandardCharsets.UTF_8));
    }

    private void manageSession(String sessionKey, StompHeaderAccessor accessor, ChatUser user, String workspaceId, String email) {
        WebSocketSessionInfoDAO existingSession = sessionManager.getWebSocketSessionInfo(sessionKey);

        if (existingSession == null) {
            logger.info("workspace-id: {} user {} connected", workspaceId, user.getId());
            sessionManager.registerSessionFromStomp(sessionKey, accessor, workspaceId, email);
        } else {
            logger.info("workspace-id: {} user {} re-connected", workspaceId, user.getId());
            sessionManager.reconnectingSessionFromStomp(sessionKey, workspaceId, email);
        }
    }

    private String extractHeaderValue(StompHeaderAccessor accessor, String headerName) {
        List<String> headerValues = accessor.getNativeHeader(headerName);
        return (headerValues != null && !headerValues.isEmpty()) ? headerValues.getFirst() : null;
    }
}