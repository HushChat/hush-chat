package com.platform.software.chat.call.dto;

import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ActiveCallInfo {
    private String callId;
    private Long conversationId;
    private String callerEmail;
    private String calleeEmail;
    private Long callerUserId;
    private Long calleeUserId;
    private Boolean isVideo;
    private Instant startedAt;
}
