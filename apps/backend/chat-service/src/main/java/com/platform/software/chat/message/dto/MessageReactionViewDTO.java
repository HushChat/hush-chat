package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.entity.MessageReaction;
import com.platform.software.chat.message.entity.ReactionTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MessageReactionViewDTO {
    private Long id;
    private ReactionTypeEnum reactionType;
    private String name;

    public MessageReactionViewDTO(MessageReaction messageReaction) {
        this.id = messageReaction.getId();
        this.reactionType = messageReaction.getReactionType();
        this.name = messageReaction.getUser().getFirstName() + " " + messageReaction.getUser().getLastName();
    }
}
