package com.platform.software.chat.message.repository;

import com.platform.software.chat.conversation.entity.QConversation;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.QConversationParticipant;
import com.platform.software.chat.message.attachment.entity.QMessageAttachment;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.entity.QMessage;
import com.platform.software.chat.user.entity.QChatUser;
import com.platform.software.common.model.CustomPageImpl;
import com.platform.software.controller.external.IdBasedPageRequest;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.jetbrains.annotations.Nullable;

import java.util.Collections;
import java.util.Date;
import java.util.List;
import java.util.Optional;

import org.postgresql.util.PGobject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

public class MessageQueryRepositoryImpl implements MessageQueryRepository {
    Logger logger = LoggerFactory.getLogger(MessageQueryRepositoryImpl.class);

    @PersistenceContext
    EntityManager entityManager;

    private static final QMessage message = QMessage.message;
    private static final QMessageAttachment messageAttachment = QMessageAttachment.messageAttachment;
    private static final QConversation conversation = QConversation.conversation;
    private static final QChatUser sender = QChatUser.chatUser;

    private final JPAQueryFactory queryFactory;

    public MessageQueryRepositoryImpl(JPAQueryFactory jpaQueryFactory) {
        this.queryFactory = jpaQueryFactory;
    }

    public Message saveMessageWthSearchVector(Message message) {
        if (message.getMessageText() != null && !message.getMessageText().isBlank()) {
            String tsvectorString = generateTSVector(message);

            message.setSearchVector(tsvectorString);
        } else {
            message.setSearchVector(null);
        }

        if (message.getId() == null) {
            entityManager.persist(message);
            return message;
        } else {
            return entityManager.merge(message);
        }
    }

    @Override
    public Optional<Message> findDeletableMessage(Long messageId, Long loggedInUserId) {
        JPAQueryFactory queryFactory = new JPAQueryFactory(entityManager);

        QMessage m = QMessage.message;
        QConversation c = QConversation.conversation;
        QChatUser u = QChatUser.chatUser;
        QConversationParticipant cp = QConversationParticipant.conversationParticipant;

        Message result = queryFactory
                .selectFrom(m)
                .innerJoin(m.conversation, c).fetchJoin()
                .innerJoin(m.sender, u).fetchJoin()
                .innerJoin(cp).on(cp.conversation.eq(c).and(cp.user.eq(u)))
                .where(
                        m.id.eq(messageId)
                                .and(m.sender.id.eq(loggedInUserId))
                                .and(c.deleted.eq(false))
                                .and(cp.isDeleted.eq(false))
                                .and(cp.isActive.eq(true))
                )
                .fetchOne();

        return Optional.ofNullable(result);
    }


    @Nullable
    private String generateTSVector(Message message) {
        // Manually generate the tsvector string using PostgreSQL's to_tsvector function
        // TODO: You can inject a JdbcTemplate if you prefer, but EntityManager is fine too
        // This is a bit of a hack as you're using a native function for a property
        // Better approach might be to use a custom converter if you want to abstract it
        String tsvectorString = null;
        Object result = entityManager.createNativeQuery(
                "SELECT to_tsvector('english', :messageText)"
            )
            .setParameter("messageText", message.getMessageText())
            .getSingleResult();

        if (result instanceof PGobject) {
            PGobject pgObject = (PGobject) result;
            tsvectorString = pgObject.getValue(); // Get the string representation
        } else if (result instanceof String) {
            // Fallback, though less likely for tsvector types directly from DB
            tsvectorString = (String) result;
        } else {
            // Handle unexpected type, log an error, or throw a more specific exception
            throw new IllegalStateException("Unexpected type returned for tsvector: " + result.getClass().getName());
        }
        return tsvectorString;
    }

    public Page<Message> findMessagesAndAttachments(Long conversationId, IdBasedPageRequest idBasedPageRequest, ConversationParticipant participant) {
        JPAQueryFactory queryFactory = new JPAQueryFactory(entityManager);

        BooleanExpression conditions = message.conversation.id.eq(conversationId)
            .and(message.sender.isNotNull())
            .and(message.conversation.deleted.eq(false));

        if(!participant.getIsActive()) {
            conditions = conditions.and(message.createdAt.before(Date.from(participant.getInactiveFrom().toInstant())));
        }

        if(participant.getLastDeletedTime() != null) {
            conditions = conditions.and(message.createdAt.after(Date.from(participant.getLastDeletedTime().toInstant())));
        }

        // Add cursor-based pagination conditions
        if(idBasedPageRequest.getAfterId() != null) {
            conditions = conditions.and(message.id.gt(idBasedPageRequest.getAfterId()));
        }

        if(idBasedPageRequest.getBeforeId() != null) {
            conditions = conditions.and(message.id.loe(idBasedPageRequest.getBeforeId()));
        }

        Long total = queryFactory
            .select(message.id.countDistinct())
            .from(message)
            .innerJoin(message.conversation, conversation)
            .innerJoin(message.sender, sender)
            .where(conditions)
            .fetchOne();

        List<Message> messages = queryFactory
            .selectDistinct(message)
            .from(message)
            .leftJoin(message.attachments, messageAttachment).fetchJoin()
            .innerJoin(message.conversation, conversation).fetchJoin()
            .innerJoin(message.sender, sender).fetchJoin()
            .where(conditions)
            .orderBy(message.id.desc())
            .limit(idBasedPageRequest.getSize())
            .fetch();

        Pageable pageable = PageRequest.of(0, idBasedPageRequest.getSize().intValue());

        return new PageImpl<>(messages, pageable, total != null ? total : 0L);
    }
}