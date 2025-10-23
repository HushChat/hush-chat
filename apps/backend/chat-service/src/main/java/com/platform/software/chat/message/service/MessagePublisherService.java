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
