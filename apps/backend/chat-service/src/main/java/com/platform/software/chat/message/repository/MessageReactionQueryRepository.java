package com.platform.software.chat.message.repository;

import java.util.List;
import java.util.Map;
import com.platform.software.chat.message.dto.MessageReactionSummaryDTO;

public interface MessageReactionQueryRepository {
   public Map<Long, MessageReactionSummaryDTO> findReactionSummaryWithUserReactions(List<Long> messageIds, Long currentUserId);
}
