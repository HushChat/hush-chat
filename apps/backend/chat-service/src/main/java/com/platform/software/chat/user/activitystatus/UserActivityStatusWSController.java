package com.platform.software.chat.user.activitystatus;

import com.platform.software.chat.user.activitystatus.dto.UserActivityWSSubscriptionData;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;

@Controller
public class UserActivityStatusWSController {

    private final WebSocketSessionManager webSocketSessionManager;
    Logger logger = LoggerFactory.getLogger(UserActivityStatusWSController.class);

    public UserActivityStatusWSController(WebSocketSessionManager webSocketSessionManager) {
        this.webSocketSessionManager = webSocketSessionManager;
    }

    @MessageMapping("/subscribed-conversations")
    public void subscribedSymbols(UserActivityWSSubscriptionData wsSubscriptionData) {
        webSocketSessionManager.subscribeUserActivityStatues(wsSubscriptionData);
    }
}
