package com.platform.software.chat.conversation.readstatus.repository;

import com.platform.software.chat.conversation.readstatus.entity.QConversationReadStatus;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public class ConversationReadStatusQueryRepositoryImpl implements ConversationReadStatusQueryRepository {
    private static final QConversationReadStatus qConversationReadStatus = QConversationReadStatus.conversationReadStatus;
    private final JPAQueryFactory queryFactory;

    public ConversationReadStatusQueryRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public Optional<Long> findLastSeenMessageIdByConversationIdAndUserId(Long conversationId, Long userId) {
        return Optional.ofNullable(queryFactory
                .select(qConversationReadStatus.message.id)
                .from(qConversationReadStatus)
                .where(qConversationReadStatus.conversation.id.eq(conversationId)
                        .and(qConversationReadStatus.user.id.eq(userId)))
                .fetchOne());
    }
}
