package com.platform.software.chat.call.dto;

import lombok.Data;

import java.time.ZonedDateTime;

@Data
public class CallParticipantViewDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private ZonedDateTime joinedAt;
    private ZonedDateTime leftAt;

    public CallParticipantViewDTO(Long id, String firstName, String lastName, ZonedDateTime joinedAt, ZonedDateTime leftAt) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.joinedAt = joinedAt;
        this.leftAt = leftAt;
    }
}