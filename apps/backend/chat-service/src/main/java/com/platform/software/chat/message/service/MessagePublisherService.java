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

package com.platform.software.chat.message.service;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

@Service
public class MessagePublisherService {
    private final String MESSAGE_INVOKE_PATH = "/topic/message-received";

    private final ConversationUtilService conversationUtilService;
    private final WebSocketSessionManager webSocketSessionManager;
    private final SimpMessagingTemplate template;

    public MessagePublisherService(
        ConversationUtilService conversationUtilService,
        WebSocketSessionManager webSocketSessionManager,
        SimpMessagingTemplate template
    ) {
        this.conversationUtilService = conversationUtilService;
        this.webSocketSessionManager = webSocketSessionManager;
        this.template = template;
    }

    /**
     * Invoke new message to participants.
     *
     * @param conversationId the conversation id
     * @param messageViewDTO the message view dto
     * @param senderId       the sender id
     * @param workspaceId       the tenant id
     */
    @Async
    @Transactional(propagation = Propagation.REQUIRES_NEW, isolation = Isolation.READ_COMMITTED, readOnly = true)
    public void invokeNewMessageToParticipants(Long conversationId, MessageViewDTO messageViewDTO, Long senderId, String workspaceId) {
        ConversationDTO conversationDTO = conversationUtilService.getConversationDTOOrThrow(senderId, conversationId);
        if (!conversationDTO.getIsGroup()) { // when sending ws message, conversation name need to be named of the message sender for non group conversations
            conversationDTO.getParticipants().stream()
                .filter(participant -> participant.getUser().getId().equals(senderId))
                .findFirst()
                .ifPresent(participant -> {
                    conversationDTO.setName("%s %s".formatted(participant.getUser().getFirstName(), participant.getUser().getLastName()));
                });
        }

        messageViewDTO.setConversationId(conversationId);

        conversationDTO.setMessages(List.of(messageViewDTO));

        conversationDTO.getParticipants().stream()
            .filter(p -> !p.getUser().getId().equals(senderId))
            .map(p -> p.getUser().getEmail())
            .forEach(email -> {
                String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
                String sessionKey = "%s:%s".formatted(workspaceId, encodedEmail);

                webSocketSessionManager.getValidSession(sessionKey)
                    .ifPresent(session -> template.convertAndSend(
                        "%s/%s".formatted(MESSAGE_INVOKE_PATH, encodedEmail),
                        conversationDTO
                    ));
            });
    }
}
