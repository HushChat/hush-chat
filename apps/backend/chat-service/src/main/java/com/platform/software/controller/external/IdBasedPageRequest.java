package com.platform.software.controller.external;

import lombok.Data;

@Data
public class IdBasedPageRequest {
    private Long afterId;
    private Long beforeId;
    private Long size = 10L;
}
