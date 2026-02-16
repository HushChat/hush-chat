package com.platform.software.chat.call.dto;

import lombok.Data;

@Data
public class CallAnswerDTO {
    private Long callLogId;
    private String sdp;
}
