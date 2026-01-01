package com.platform.software.chat.conversation.typingstatus;

import com.platform.software.chat.conversation.typingstatus.dto.UserTypingStatusDTO;
import com.platform.software.chat.conversation.typingstatus.dto.UserTypingStatusUpsertDTO;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.chat.user.service.UserServiceImpl;
import com.platform.software.common.constants.WebSocketTopicConstants;
import com.platform.software.config.interceptors.websocket.WebSocketSessionInfoDAO;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import com.platform.software.config.workspace.WorkspaceContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;


@Service
public class TypingStatusWSService {

    private final SimpMessagingTemplate template;
    private final WebSocketSessionManager webSocketSessionManager;
    private final TypingThrottle typingThrottle;
    private final UserServiceImpl userService;
    Logger logger = LoggerFactory.getLogger(TypingStatusWSService.class);


    public TypingStatusWSService(SimpMessagingTemplate template, WebSocketSessionManager webSocketSessionManager, TypingThrottle typingThrottle, UserServiceImpl userService) {
        this.template = template;
        this.webSocketSessionManager = webSocketSessionManager;
        this.typingThrottle = typingThrottle;
        this.userService = userService;
    }

    @Async
    public void invokeUserIsTyping(UserTypingStatusUpsertDTO userTypingStatusUpsertDTO, String wsSessionId) {

        // Throttle typing invokes
        if (!typingThrottle.shouldSend(wsSessionId) || !userTypingStatusUpsertDTO.isTyping()) {
            return;
        }

        try {
            WorkspaceContext.setCurrentWorkspace(userTypingStatusUpsertDTO.getWorkspaceId());

            UserViewDTO user = userService.findUserById(userTypingStatusUpsertDTO.getUserId(), userTypingStatusUpsertDTO.getWorkspaceId());

            for (WebSocketSessionInfoDAO info : webSocketSessionManager.getWebSocketSessionInfos().values()) {
                if(info.getWsSessionId().equals(wsSessionId)){
                    continue;
                }
                if (info.getOpenedConversation() == null) {
                    continue;
                }
                if (!userTypingStatusUpsertDTO.getConversationId().equals(info.getOpenedConversation())) {
                    continue;
                }
                if (!info.getWsSessionId()
                        .startsWith(userTypingStatusUpsertDTO.getWorkspaceId() + ":")) {
                    continue;
                }
                template.convertAndSendToUser(
                        info.getWsSessionId(),
                        WebSocketTopicConstants.TYPING_STATUS,
                        new UserTypingStatusDTO(
                                user.getFirstName(),
                                userTypingStatusUpsertDTO.getConversationId(),
                                userTypingStatusUpsertDTO.isTyping()
                        )
                );
            }
        } catch (Exception e) {
            logger.warn("User typing status WebSocket message failed: {}", e.getMessage());
        }
    }
}
