package com.platform.software.chat.message.repository;

import com.platform.software.chat.conversation.entity.QConversation;
import com.platform.software.chat.message.entity.MessageMention;
import com.platform.software.chat.message.entity.QMessage;
import com.platform.software.chat.message.entity.QMessageMention;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Objects;

public class MessageMentionQueryRepositoryImpl implements MessageMentionQueryRepository{
    private final JPAQueryFactory jpaQueryFactory;

    private static final QMessageMention qMessageMention = QMessageMention.messageMention;
    private static final QMessage qMessage = QMessage.message;
    private static final QConversation qConversation = QConversation.conversation;

    public MessageMentionQueryRepositoryImpl(JPAQueryFactory jpaQueryFactory) {
        this.jpaQueryFactory = jpaQueryFactory;
    }

    public Page<MessageMention> findAllUserMentionsByOthers(Long mentionedUserId, Pageable pageable) {
        BooleanExpression whereConditions = qMessageMention.mentionedUser.id.eq(mentionedUserId);

        List<MessageMention> result = jpaQueryFactory
                .select(qMessageMention)
                .from(qMessageMention)
                .leftJoin(qMessageMention.message, qMessage).fetchJoin()
                .leftJoin(qMessage.conversation, qConversation).fetchJoin()
                .where(whereConditions)
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .fetch();

        Long total = jpaQueryFactory
                .select(qMessageMention.count())
                .from(qMessageMention)
                .where(whereConditions)
                .fetchOne();

        long totalCount = Objects.requireNonNullElse(total, 0L);

        return new PageImpl<>(result, pageable, totalCount);
    }
}
