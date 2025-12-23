package com.platform.software.chat.conversation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.Date;

@Data
@AllArgsConstructor
public class InviteLinkDTO {
    private String inviteUrl;
    private Date expiresAt;
}
