package com.platform.software.chat.conversation.readstatus.repository;

import com.platform.software.chat.conversation.entity.QConversation;
import com.platform.software.chat.conversation.readstatus.dto.ConversationReadInfo;
import com.platform.software.chat.conversation.readstatus.dto.ConversationUnreadCount;
import com.platform.software.chat.conversation.readstatus.entity.ConversationReadStatus;
import com.platform.software.chat.conversation.readstatus.entity.QConversationReadStatus;
import com.platform.software.chat.message.entity.QMessage;
import com.querydsl.core.group.GroupBy;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Repository
public class ConversationReadStatusQueryRepositoryImpl  implements ConversationReadStatusQueryRepository {
    private static final QConversationReadStatus qConversationReadStatus = QConversationReadStatus.conversationReadStatus;
    private static final QConversation qConversation = QConversation.conversation;
    private static final QMessage qMessage = QMessage.message;
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

    @Override
    public Map<Long, Long> findUnreadMessageCountsByConversationIdsAndUserId(
        Collection<Long> conversationIds, Long userId) {

        List<ConversationUnreadCount> conversationUnreadCounts = buildUnreadCountQuery(userId)
            .where(qConversation.id.in(conversationIds))
            .groupBy(qConversation.id)
            .fetch();

        return conversationUnreadCounts.stream()
            .collect(Collectors.toMap(
                ConversationUnreadCount::getConversationId,
                ConversationUnreadCount::getUnreadCount
            ));
    }

    @Override
    public ConversationReadInfo findConversationReadInfoByConversationIdAndUserId(
        Long conversationId, Long userId) {

        // Get the ConversationReadStatus
        ConversationReadStatus readStatus = queryFactory
            .selectFrom(qConversationReadStatus)
            .where(qConversationReadStatus.conversation.id.eq(conversationId)
                .and(qConversationReadStatus.user.id.eq(userId)))
            .fetchOne();

        // Get the unread count
        Long unreadCount = queryFactory
            .select(qMessage.id.count())
            .from(qMessage)
            .where(qMessage.conversation.id.eq(conversationId)
                .and(qMessage.isUnsend.isFalse())
                .and(buildUnreadMessageCondition(readStatus)))
            .fetchOne();

        return new ConversationReadInfo(
            readStatus != null && readStatus.getMessage() != null ? readStatus.getMessage().getId() : null,
            unreadCount != null ? unreadCount : 0L
        );
    }

    private JPAQuery<ConversationUnreadCount> buildUnreadCountQuery(Long userId) {
        return queryFactory
            .select(Projections.constructor(
                ConversationUnreadCount.class,
                qConversation.id,
                qMessage.id.count()
            ))
            .from(qConversation)
            .leftJoin(qConversationReadStatus)
            .on(buildReadStatusJoinCondition(userId))
            .leftJoin(qMessage)
            .on(buildUnreadMessageJoinCondition());
    }

    private BooleanExpression buildReadStatusJoinCondition(Long userId) {
        return qConversationReadStatus.conversation.id.eq(qConversation.id)
            .and(qConversationReadStatus.user.id.eq(userId));
    }

    private BooleanExpression buildUnreadMessageJoinCondition() {
        return qMessage.conversation.id.eq(qConversation.id)
            .and(qMessage.isUnsend.isFalse())
            .and(
                qConversationReadStatus.message.id.isNull()
                    .or(qMessage.id.gt(qConversationReadStatus.message.id))
            );
    }

    private BooleanExpression buildUnreadMessageCondition(ConversationReadStatus readStatus) {
        if (readStatus == null || readStatus.getMessage() == null) {
            // No read status exists, all messages are unread
            return null; // No additional filtering needed
        }
        // Only count messages with ID greater than last read message
        return qMessage.id.gt(readStatus.getMessage().getId());
    }
}
