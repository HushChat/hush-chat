package com.platform.software.chat.call.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CallSignalingDTO {
    private Long conversationId;
    private Long callLogId;
    private Long callerId;
    private Long calleeId;
    private String type;
    private String sdp;
    private String candidate;
    private Boolean isVideo;
    private String callerName;
    private String callerEmail;
    private String reason;
}
