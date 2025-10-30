package com.platform.software.chat.conversationparticipant.repository;

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.QConversationParticipant;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;

import java.time.ZoneOffset;
import java.time.ZonedDateTime;

@Repository
public class ConversationParticipantCommandRepositoryImpl implements ConversationParticipantCommandRepository {

    private final JPAQueryFactory queryFactory;

    public ConversationParticipantCommandRepositoryImpl(JPAQueryFactory jpaQueryFactory) {
        this.queryFactory = jpaQueryFactory;
    }


    @Override
    public long toggleFavorite(Long conversationId, Long userId) {
        QConversationParticipant cp = QConversationParticipant.conversationParticipant;

         return queryFactory
                .update(cp)
                .set(cp.isFavorite, cp.isFavorite.not())
                .where(memberOfConversation(cp, conversationId, userId))
                .execute();
    }

    @Override
    public long togglePinned(Long conversationId, Long userId) {

        // TODO: need to combine these 2 queries to a one
        QConversationParticipant cp = QConversationParticipant.conversationParticipant;

        ConversationParticipant participant = queryFactory
                .selectFrom(cp)
                .where(
                        cp.conversation.id.eq(conversationId),
                        cp.user.id.eq(userId),
                        cp.isDeleted.isFalse()
                )
                .fetchOne();

        if (participant == null) {
            return 0;
        }

        ZonedDateTime newPinnedAt = participant.getIsPinned() ? null : ZonedDateTime.now(ZoneOffset.UTC);

        return queryFactory
                .update(cp)
                .set(cp.isPinned, !participant.getIsPinned())
                .set(cp.pinnedAt, newPinnedAt)
                .where(
                        cp.conversation.id.eq(conversationId),
                        cp.user.id.eq(userId),
                        cp.isDeleted.isFalse()
                )
                .execute();
    }

    @Override
    public long toggleArchived(Long conversationId, Long userId) {
        QConversationParticipant cp = QConversationParticipant.conversationParticipant;

        return queryFactory
                .update(cp)
                .set(cp.archived, cp.archived.not())
                .where(memberOfConversation(cp, conversationId, userId))
                .execute();
    }

    private BooleanExpression memberOfConversation(QConversationParticipant cp, Long conversationId, Long userId) {
        return cp.conversation.id.eq(conversationId)
                .and(cp.user.id.eq(userId))
                .and(cp.isDeleted.isFalse());
    }
}
