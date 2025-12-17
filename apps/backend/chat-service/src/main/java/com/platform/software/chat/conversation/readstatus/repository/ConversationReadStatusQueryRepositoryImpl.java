package com.platform.software.chat.conversation.readstatus.repository;

import com.platform.software.chat.conversation.entity.QConversation;
import com.platform.software.chat.conversation.readstatus.dto.ConversationReadInfo;
import com.platform.software.chat.conversation.readstatus.dto.ConversationUnreadCount;
import com.platform.software.chat.conversation.readstatus.entity.QConversationReadStatus;
import com.platform.software.chat.conversationparticipant.entity.QConversationParticipant;
import com.platform.software.chat.message.entity.QMessage;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.stream.Collectors;

@Repository
public class ConversationReadStatusQueryRepositoryImpl  implements ConversationReadStatusQueryRepository {
    private static final QConversationReadStatus qConversationReadStatus = QConversationReadStatus.conversationReadStatus;
    private static final QConversation qConversation = QConversation.conversation;
    private static final QMessage qMessage = QMessage.message;
    private static final QConversationParticipant qParticipant = QConversationParticipant.conversationParticipant;
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

        return queryFactory
            .select(Projections.constructor(
                ConversationReadInfo.class,
                qConversationReadStatus.message.id,
                qMessage.id.count()
            ))
            .from(qMessage)
            .leftJoin(qConversationReadStatus)
            .on(qConversationReadStatus.conversation.id.eq(conversationId)
                .and(qConversationReadStatus.user.id.eq(userId)))
            .where(qMessage.conversation.id.eq(conversationId)
                .and(qMessage.isUnsend.isFalse())
                .and(qConversationReadStatus.message.id.isNull()
                    .or(qMessage.id.gt(qConversationReadStatus.message.id))))
            .groupBy(qConversationReadStatus.message.id)
            .fetchOne();
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
                .on(joinReadStatusForUser(userId))
            .leftJoin(qParticipant)
                .on(qParticipant.conversation.id.eq(qConversation.id)
                    .and(qParticipant.user.id.eq(userId)))
            .leftJoin(qMessage)
                .on(joinUnreadMessages())
            .groupBy(qConversation.id);
    }

    private BooleanExpression joinReadStatusForUser(Long userId) {
        return qConversationReadStatus.conversation.id.eq(qConversation.id)
            .and(qConversationReadStatus.user.id.eq(userId));
    }

    private BooleanExpression joinUnreadMessages() {
        return qMessage.conversation.id.eq(qConversation.id)
            .and(qMessage.isUnsend.isFalse())
            .and(
                qConversationReadStatus.message.id.isNull()
                    .or(qMessage.id.gt(qConversationReadStatus.message.id))
            )
            .and(
                qParticipant.lastDeletedTime.isNull()
                .or(qMessage.createdAt.gt(
                Expressions.dateTimePath(java.util.Date.class, qParticipant.lastDeletedTime.getMetadata())
            ))
            );
    }

    @Override
    public Map<Long, Long> findLastReadMessageIdsByConversationId(Long conversationId) {

        List<Tuple> results = queryFactory
            .select(
                qParticipant.user.id,
                qConversationReadStatus.message.id
            )
            .from(qParticipant)
            .leftJoin(qConversationReadStatus)
            .on(qConversationReadStatus.conversation.id.eq(conversationId)
                .and(qConversationReadStatus.user.id.eq(qParticipant.user.id)))
            .where(qParticipant.conversation.id.eq(conversationId)
                .and(qParticipant.isActive.isTrue()))
            .fetch();

        Map<Long, Long> resultMap = new HashMap<>();
        for (Tuple tuple : results) {
            resultMap.put(
                tuple.get(qParticipant.user.id),
                tuple.get(qConversationReadStatus.message.id)
            );
        }
        return resultMap;
    }
}
