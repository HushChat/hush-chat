package com.platform.software.chat.message.repository;

import com.platform.software.chat.message.dto.MessageReactionSummaryDTO;

import java.util.List;
import java.util.Map;

public interface MessageReactionQueryRepository {
    public Map<Long, MessageReactionSummaryDTO> findReactionSummaryWithUserReactions(List<Long> messageIds, Long currentUserId);
}
