package com.platform.software.config.interceptors.websocket;

import com.platform.software.chat.notification.entity.DeviceType;
import com.platform.software.chat.user.activitystatus.dto.UserStatusEnum;
import lombok.*;

import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class WebSocketSessionInfoDAO {
    private String stompSessionId;

    @Builder.Default
    private Map<String, Object> sessionAttributes = new HashMap<>();

    // Session timing metadata
    private ZonedDateTime connectedTime;
    private ZonedDateTime createdTime;
    private ZonedDateTime updatedTime;
    private ZonedDateTime disconnectedTime; // to get the last seen date time

    private Set<Long> visibleConversations; // list of conversations visible - mobile or web
    private Long openedConversation; // indicates user's selected conversation, could be null
    private DeviceType deviceType;
    private UserStatusEnum availabilityStatus;
}