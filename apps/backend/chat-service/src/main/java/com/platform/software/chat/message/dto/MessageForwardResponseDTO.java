package com.platform.software.chat.message.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MessageForwardResponseDTO {
    private List<Long> forwardedTo;
}
