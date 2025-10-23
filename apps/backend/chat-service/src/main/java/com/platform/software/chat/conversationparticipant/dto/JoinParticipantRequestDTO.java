package com.platform.software.chat.conversationparticipant.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.Set;

@Data
public class JoinParticipantRequestDTO {

    @NotNull
    @NotEmpty(message = "User IDs list cannot be empty")
    private Set<Long> userIds;
}
