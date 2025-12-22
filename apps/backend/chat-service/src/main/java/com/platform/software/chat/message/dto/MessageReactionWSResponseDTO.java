package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.entity.ReactionTypeEnum;
import com.platform.software.common.model.MessageReactionActionEnum;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MessageReactionWSResponseDTO {
    private Long conversationId;
    private Long messageId;
    private Long actorUserId;
    private ReactionTypeEnum reactionType;  
    private ReactionTypeEnum previousReactionType;
    private MessageReactionActionEnum reactionAction;        
}
