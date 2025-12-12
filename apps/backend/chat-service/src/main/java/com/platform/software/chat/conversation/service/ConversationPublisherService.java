package com.platform.software.chat.conversation.service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;

@Service
public class ConversationPublisherService {
    private static final String CONVERSATION_INVOKE_PATH = "/topic/conversation-created";

    private final ConversationUtilService conversationUtilService;
    private final WebSocketSessionManager webSocketSessionManager;
    private final SimpMessagingTemplate template;

    public ConversationPublisherService(
        ConversationUtilService conversationUtilService,
        WebSocketSessionManager webSocketSessionManager,
        SimpMessagingTemplate template
    ) {
        this.conversationUtilService = conversationUtilService;
        this.webSocketSessionManager = webSocketSessionManager;
        this.template = template;
    }

    @Async
    @Transactional(readOnly = true)
    public void invokeNewConversationToParticipants(
        Long conversationId,
        Long actorUserId,
        String workspaceId,
        ConversationDTO providedDTO // can be null
    ) {
        // Build DTO (actor view as base)
        ConversationDTO baseDTO = providedDTO != null
            ? providedDTO
            : conversationUtilService.getConversationDTOOrThrow(actorUserId, conversationId);

        // We need participants ONLY for routing. So grab them now.
        if (baseDTO.getParticipants() == null || baseDTO.getParticipants().isEmpty()) {
            // If this can happen in your codebase, then you DO need a repo/util fallback.
            // But for now, just bail safely.
            return;
        }

        // Prepare payload for chat list (minimize WS payload)
        ConversationDTO payloadDTO = new ConversationDTO(baseDTO);
        payloadDTO.setParticipants(null);

        for (ConversationParticipantViewDTO participant : baseDTO.getParticipants()) {
            if (participant.getUser() == null || participant.getUser().getEmail() == null) continue;

            // Usually don't send the "conversation-created" event back to creator
            if (participant.getUser().getId() != null && participant.getUser().getId().equals(actorUserId)) {
                continue;
            }

            String email = participant.getUser().getEmail();
            String encodedEmail = URLEncoder.encode(email, StandardCharsets.UTF_8);
            String sessionKey = "%s:%s".formatted(workspaceId, encodedEmail);

            webSocketSessionManager.getValidSession(sessionKey).ifPresent(session -> {
                template.convertAndSend(
                    "%s/%s".formatted(CONVERSATION_INVOKE_PATH, encodedEmail),
                    payloadDTO
                );
            });
        }
    }
}
