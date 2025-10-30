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

package com.platform.software.config.interceptors.websocket;

import com.platform.software.chat.user.service.UserService;
import com.platform.software.config.aws.AWSCognitoConfig;
import com.platform.software.platform.workspaceuser.service.WorkspaceUserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Value("${ws.allowed-origins}")
    private String wsAllowedOrigins;

    private final AWSCognitoConfig awsCognitoConfig;
    private final WebSocketSessionManager sessionManager;
    private final UserService userService;
    private final WorkspaceUserService workspaceUserService;

    public WebSocketConfig(
        AWSCognitoConfig awsCognitoConfig,
        @Lazy WebSocketSessionManager sessionManager,
        UserService userService,
        WorkspaceUserService workspaceUserService
    ) {
        this.awsCognitoConfig = awsCognitoConfig;
        this.sessionManager = sessionManager;
        this.userService = userService;
        this.workspaceUserService = workspaceUserService;
    }

    @Bean
    public ThreadPoolTaskScheduler websocketTaskScheduler() {
        ThreadPoolTaskScheduler scheduler = new ThreadPoolTaskScheduler();
        scheduler.setPoolSize(2);
        scheduler.setThreadNamePrefix("wss-heartbeat-thread-");
        scheduler.initialize();
        return scheduler;
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        long heartbeatServer = 10000;
        long heartbeatClient = 10000;

        config.enableSimpleBroker("/topic")
            .setHeartbeatValue(new long[]{heartbeatServer, heartbeatClient})
            .setTaskScheduler(websocketTaskScheduler());
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry
            .addEndpoint("/ws-message-subscription")
            .setAllowedOrigins(wsAllowedOrigins);
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new WebSocketAuthorizationInterceptor(sessionManager, awsCognitoConfig, userService, workspaceUserService));
    }
}