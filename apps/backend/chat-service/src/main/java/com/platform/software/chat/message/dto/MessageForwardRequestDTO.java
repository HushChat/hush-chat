package com.platform.software.chat.message.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.Set;

@Data
public class MessageForwardRequestDTO {
    @NotEmpty(message = "Forwarded message IDs cannot be empty")
    private Set<Long> forwardedMessageIds;

    @NotEmpty(message = "Conversation IDs cannot be empty")
    private Set<Long> conversationIds;

    private String customText;
}
