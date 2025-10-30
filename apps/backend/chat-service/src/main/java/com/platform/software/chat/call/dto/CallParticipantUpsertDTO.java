package com.platform.software.chat.call.dto;

import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class CallParticipantUpsertDTO {
    private Long userId;
    private ZonedDateTime joinedAt;
    private ZonedDateTime leftAt;
}
