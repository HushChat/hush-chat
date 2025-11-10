package com.platform.software.chat.conversation.readstatus.repository;

import java.util.Optional;

public interface ConversationReadStatusQueryRepository {
    Optional<Long> findLastSeenMessageIdByConversationIdAndUserId(Long conversationId, Long userId);
}
