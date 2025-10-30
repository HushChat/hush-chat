package com.platform.software.config.interceptors.websocket;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WebSocketSessionInfoDAO {
    private String stompSessionId;

    @Builder.Default
    private Map<String, Object> sessionAttributes = new HashMap<>();

    // Session timing metadata
    private ZonedDateTime connectedTime;
    private ZonedDateTime createdTime;
    private ZonedDateTime updatedTime;
}