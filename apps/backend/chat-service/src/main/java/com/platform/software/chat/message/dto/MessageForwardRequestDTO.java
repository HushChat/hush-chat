package com.platform.software.chat.message.dto;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.HashSet;
import java.util.Set;

@Data
public class MessageForwardRequestDTO {
    @NotEmpty(message = "Forwarded message IDs cannot be empty")
    private Set<Long> forwardedMessageIds;

    private Set<Long> conversationIds;

    private Set<Long> userIds;

    private String customText;

    private Boolean isMarkdownEnabled = false;

    public void addConversationIds(Set<Long> ids) {
        if (ids == null || ids.isEmpty()) {
            return;
        }

        if (this.conversationIds == null) {
            this.conversationIds = new HashSet<>();
        }

        this.conversationIds.addAll(ids);
    }
}
