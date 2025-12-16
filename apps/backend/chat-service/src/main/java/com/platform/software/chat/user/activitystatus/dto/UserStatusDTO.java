package com.platform.software.chat.user.activitystatus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusDTO {
    private Long conversationId;
    private UserStatusEnum status;
}