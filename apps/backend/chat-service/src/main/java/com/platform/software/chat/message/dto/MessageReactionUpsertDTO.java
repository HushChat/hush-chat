package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.entity.ReactionTypeEnum;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class MessageReactionUpsertDTO {

    @NotNull
    private ReactionTypeEnum reactionType;
}
