package com.platform.software.chat.conversation.repository;

import com.platform.software.chat.conversation.entity.ConversationEvent;
import com.platform.software.chat.conversation.entity.QConversationEvent;
import com.platform.software.config.interceptors.websocket.WebSocketSessionManager;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.context.annotation.Lazy;

import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class ConversationEventQueryRepositoryImpl implements ConversationEventQueryRepository {
    private final QConversationEvent qConversationEvent = QConversationEvent.conversationEvent;

    private final JPAQueryFactory jpaQueryFactory;

    public ConversationEventQueryRepositoryImpl(JPAQueryFactory jpaQueryFactory) {
        this.jpaQueryFactory = jpaQueryFactory;
    }

    @Override
    public Map<Long, ConversationEvent> findByMessageIdsAsMap(Collection<Long> messageIds) {
        if (messageIds == null || messageIds.isEmpty()) {
            return Collections.emptyMap();
        }


        List<ConversationEvent> events = jpaQueryFactory
            .selectFrom(qConversationEvent)
            .where(qConversationEvent.message.id.in(messageIds))
            .fetch();

        return events.stream()
            .collect(Collectors.toMap(
                event -> event.getMessage().getId(),
                event -> event,
                (existing, replacement) -> existing
            ));
    }
}
