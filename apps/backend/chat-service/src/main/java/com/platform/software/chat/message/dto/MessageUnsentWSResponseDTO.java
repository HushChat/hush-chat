package com.platform.software.chat.message.dto;

import com.platform.software.chat.user.dto.UserBasicViewDTO;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MessageUnsentWSResponseDTO {
    private Long conversationId;
    private Long messageId;
    private Long actorUserId;
    private UserBasicViewDTO unsentBy;
}
