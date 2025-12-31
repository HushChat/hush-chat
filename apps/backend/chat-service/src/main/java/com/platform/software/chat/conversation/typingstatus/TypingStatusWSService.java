package com.platform.software.chat.conversation.typingstatus;

import com.platform.software.chat.conversation.typingstatus.dto.UserTypingStatusDTO;
import com.platform.software.chat.user.activitystatus.dto.UserStatusDTO;
import com.platform.software.common.constants.WebSocketTopicConstants;
import com.platform.software.config.interceptors.websocket.WebSocketSessionInfoDAO;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import com.platform.software.config.workspace.WorkspaceContext;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class TypingStatusWSService {

    private final SimpMessagingTemplate template;
    private final WebSocketSessionManager webSocketSessionManager;
    private final TypingThrottle typingThrottle;


    public TypingStatusWSService(SimpMessagingTemplate template, WebSocketSessionManager webSocketSessionManager, TypingThrottle typingThrottle) {
        this.template = template;
        this.webSocketSessionManager = webSocketSessionManager;
        this.typingThrottle = typingThrottle;
    }

    @Async
    public void invokeUserIsTyping(UserTypingStatusDTO userTypingStatusDTO, String wsSessionId) {

        // Throttle typing invokes
        if (!typingThrottle.shouldSend(wsSessionId)) {
            return;
        }

        WorkspaceContext.setCurrentWorkspace(userTypingStatusDTO.getWorkspaceId());

        for (WebSocketSessionInfoDAO info : webSocketSessionManager.getWebSocketSessionInfos().values()) {
            if (info.getOpenedConversation() == null) {
                continue;
            }
            if (!userTypingStatusDTO.getConversationId().equals(info.getOpenedConversation())) {
                continue;
            }
            if (!info.getWsSessionId()
                    .startsWith(userTypingStatusDTO.getWorkspaceId() + ":")) {
                continue;
            }
            template.convertAndSendToUser(
                    info.getWsSessionId(),
                    WebSocketTopicConstants.TYPING_STATUS,
                    new UserStatusDTO()
            );
        }
    }
}
