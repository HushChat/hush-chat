package com.platform.software.chat.user.activitystatus.service;

import com.platform.software.chat.conversationparticipant.repository.ConversationParticipantRepository;
import com.platform.software.chat.notification.entity.DeviceType;
import com.platform.software.chat.user.activitystatus.dto.UserStatusDTO;
import com.platform.software.chat.user.activitystatus.dto.UserStatusEnum;
import com.platform.software.common.constants.WebSocketTopicConstants;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import com.platform.software.config.workspace.WorkspaceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserActivityStatusWSService {

    private final ConversationParticipantRepository conversationParticipantRepository;
    private final SimpMessagingTemplate template;
    private final WebSocketSessionManager webSocketSessionManager;

    @Async
    public void invokeUserActivityStatus(String workspaceId, String email, UserStatusEnum status, String deviceType) {
        WorkspaceContext.setCurrentWorkspace(workspaceId);

        // TODO: cache, must be sure about the cache evict
        // 1-to-1 conversation ids of the user with the email
        List<Long> conversationIds = conversationParticipantRepository.findOneToOneConversationIdsByUserEmail(email);

        // Find all WebSocket sessions that have any of the given conversation IDs in their visible conversations,
        // and return a map of session keys to the specific conversation IDs that matched
        Set<Long> conversationIdSet = new HashSet<>(conversationIds);

        Map<String, Set<Long>> matchingSessionKeysWithConversations = webSocketSessionManager.getWebSocketSessionInfos().entrySet().stream()
            .map(entry -> {
                Set<Long> visibleConversations = entry.getValue().getVisibleConversations();
                if (visibleConversations == null || visibleConversations.isEmpty()) {
                    return null;
                }

                Set<Long> matchingConversationIds = visibleConversations.stream()
                    .filter(conversationIdSet::contains)
                    .collect(Collectors.toSet());

                return matchingConversationIds.isEmpty() ? null : Map.entry(entry.getKey(), matchingConversationIds);
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toMap(Map.Entry::getKey, Map.Entry::getValue));

        DeviceType device = DeviceType.valueOf(deviceType);

        for (Map.Entry<String, Set<Long>> entry : matchingSessionKeysWithConversations.entrySet()) {
            String key = entry.getKey();
            String[] parts = key.split(":");
            String userPrinciple = parts[0] + ":" + parts[1];

            if (!entry.getValue().isEmpty()) {
                template.convertAndSendToUser(
                    userPrinciple,
                    WebSocketTopicConstants.ONLINE_STATUS,
                    new UserStatusDTO(entry.getValue().stream().findFirst().get(), email, status, device)
                );
            }
        }
    }
}