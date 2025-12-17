package com.platform.software.chat.message.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MessageReactionWSResponseDTO {
    private Long conversationId;
    private Long messageId;
    private Long actorUserId;
    private String reactionType;  
    private String previousReactionType;
    private String action;        
}
