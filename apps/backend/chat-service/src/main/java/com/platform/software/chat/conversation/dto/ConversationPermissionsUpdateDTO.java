package com.platform.software.chat.conversation.dto;

import lombok.Data;

import jakarta.validation.constraints.NotNull;

@Data
public class ConversationPermissionsUpdateDTO {
    @NotNull
    private Boolean onlyAdminsCanSendMessages;
}
