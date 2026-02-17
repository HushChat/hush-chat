package com.platform.software.chat.call.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;

@Data
@EqualsAndHashCode(callSuper = true)
public class CallSignalOutboundDTO extends CallSignalDTO {
    private String callerName;
    private Long callerUserId;
    private String callerImageUrl;
}
