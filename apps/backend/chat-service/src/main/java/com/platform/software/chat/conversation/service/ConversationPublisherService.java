package com.platform.software.chat.conversation.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.common.constants.WebSocketTopicConstants;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;

@Service
public class ConversationPublisherService {
    private final ConversationUtilService conversationUtilService;
    private final WebSocketSessionManager webSocketSessionManager;

    public ConversationPublisherService(
            ConversationUtilService conversationUtilService,
            WebSocketSessionManager webSocketSessionManager  
    ) {
        this.conversationUtilService = conversationUtilService;
        this.webSocketSessionManager = webSocketSessionManager;
    }

    /**
     * @param conversationId the ID of the conversation being created
     * @param actorUserId    the ID of the user who initiated the conversation
     * @param workspaceId    the workspace (tenant) identifier
     * @param providedDTO    an optional pre-built conversation DTO to reuse;
     *                       if {@code null}, the DTO will be fetched from persistence
    */
    @Async
    @Transactional(readOnly = true)
    public void invokeNewConversationToParticipants(
            Long conversationId,
            Long actorUserId,
            String workspaceId,
            ConversationDTO providedDTO) {
        ConversationDTO baseDTO = providedDTO != null
                ? providedDTO
                : conversationUtilService.getConversationDTOOrThrow(actorUserId, conversationId);

        if (baseDTO.getParticipants() == null || baseDTO.getParticipants().isEmpty()) {
            return;
        }

        ConversationDTO payloadDTO = new ConversationDTO(baseDTO);
        payloadDTO.setParticipants(null);

        for (ConversationParticipantViewDTO participant : baseDTO.getParticipants()) {
            if (participant.getUser() == null || participant.getUser().getEmail() == null)
                continue;

            Long participantUserId = participant.getUser().getId();
            if (participantUserId != null && participantUserId.equals(actorUserId))
                continue;

            webSocketSessionManager.sendMessageToUser(
                    workspaceId,
                    participant.getUser().getEmail(),
                    WebSocketTopicConstants.CONVERSATION_CREATED,
                    payloadDTO);
        }
    }
}
