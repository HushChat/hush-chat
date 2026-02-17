package com.platform.software.chat.call.dto;

import lombok.Data;

@Data
public class CallInitiateDTO {
    private Long conversationId;
    private String sdp;
    private Boolean isVideo = false;
}
