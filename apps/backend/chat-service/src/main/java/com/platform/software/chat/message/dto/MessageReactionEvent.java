package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.entity.ReactionTypeEnum;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.MessageReactionActionEnum;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MessageReactionEvent {
    private final String workspaceId;
    private final Long conversationId;
    private final Long messageId;
    private final Long actorUserId;
    private final ReactionTypeEnum reactionType;
    private final ReactionTypeEnum previousReactionType;
    private final MessageReactionActionEnum reactionAction;

    private final Message message;
    private final ChatUser user;
}
