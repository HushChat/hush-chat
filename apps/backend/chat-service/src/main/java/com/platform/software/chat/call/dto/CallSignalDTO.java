package com.platform.software.chat.call.dto;

import lombok.Data;

@Data
public class CallSignalDTO {
    private String callId;
    private String type;
    private Long conversationId;
    private Boolean isVideo;
    private Object sdp;
    private Object candidate;
    private Boolean enabled;
}
