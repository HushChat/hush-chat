package com.platform.software.chat.conversation.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ConversationUpsertDTO {

    @NotNull
    private Long targetUserId;
}
