package com.platform.software.chat.call.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ActiveCallInfo {
    private Long callLogId;
    private Long conversationId;
    private Long callerId;
    private Long calleeId;
    private String callerEmail;
    private String calleeEmail;
    private String workspaceId;
    private Boolean isVideo;
    private ZonedDateTime initiatedAt;
    private boolean answered;
}
