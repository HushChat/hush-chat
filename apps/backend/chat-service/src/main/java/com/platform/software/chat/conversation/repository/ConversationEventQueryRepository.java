package com.platform.software.chat.conversation.repository;

import com.platform.software.chat.conversation.entity.ConversationEvent;

import java.util.Collection;
import java.util.Map;

public interface ConversationEventQueryRepository {
    Map<Long, ConversationEvent> findByMessageIdsAsMap(Collection<Long> messageIds);
}
