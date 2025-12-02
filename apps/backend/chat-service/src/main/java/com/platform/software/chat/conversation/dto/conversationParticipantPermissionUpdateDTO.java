package com.platform.software.chat.conversation.dto;

import lombok.Data;

import jakarta.validation.constraints.NotNull;

@Data
public class conversationParticipantPermissionUpdateDTO {
    @NotNull
    private Boolean onlyAdminsCanSendMessages;
}
