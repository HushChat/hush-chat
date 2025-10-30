package com.platform.software.chat.message.dto;

import java.util.HashMap;
import java.util.Map;

import com.platform.software.chat.message.entity.ReactionTypeEnum;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class MessageReactionSummaryDTO {
    private Map<ReactionTypeEnum, Long> counts = new HashMap<>();
    private ReactionTypeEnum currentUserReaction;
}
