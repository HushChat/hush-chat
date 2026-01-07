package com.platform.software.chat.user.repository;

import com.platform.software.chat.conversationparticipant.entity.QConversationParticipant;
import com.platform.software.chat.user.dto.UserViewDTO;
import com.platform.software.chat.user.entity.QChatUser;
import com.platform.software.chat.user.entity.QUserBlock;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.jpa.impl.JPAQuery;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Objects;

@Repository
public class UserBlockQueryRepositoryImpl implements UserBlockQueryRepository {
    @PersistenceContext
    EntityManager entityManager;

    private static final QUserBlock userBlock = QUserBlock.userBlock;
    private static final QChatUser blockedUser = new QChatUser("blockedUser");
    private static final QConversationParticipant cpBlocker = new QConversationParticipant("cpBlocker");
    private static final QConversationParticipant cpBlocked = new QConversationParticipant("cpBlocked");

    @Override
    public Page<UserViewDTO> getBlockedUsersById(Pageable pageable, Long blockerId) {
        BooleanExpression predicate = userBlock.blocker.id.eq(blockerId)
                .and(blockedUser.active.isTrue())
                .and(blockedUser.deleted.isFalse());

        JPAQuery<?> baseQuery = new JPAQuery<>(entityManager)
                .from(userBlock)
                .innerJoin(userBlock.blocked, blockedUser)
                .where(predicate);

        List<UserViewDTO> blockedUsers = baseQuery.clone()
                .select(Projections.constructor(
                        UserViewDTO.class,
                        blockedUser.id,
                        blockedUser.firstName,
                        blockedUser.lastName,
                        blockedUser.email
                ))
                .orderBy(userBlock.createdAt.desc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize())
                .fetch();

        Long total = baseQuery.clone()
                .select(userBlock.count())
                .fetchOne();
        long totalCount = Objects.requireNonNullElse(total, 0L);

        return new PageImpl<>(blockedUsers, pageable, totalCount);
    }

    @Override
    public boolean isUserBlocked(Long blockerId, Long blockedId) {
        return new JPAQuery<>(entityManager)
                .from(userBlock)
                .where(userBlock.blocker.id.eq(blockerId)
                        .and(userBlock.blocked.id.eq(blockedId)))
                .select(Expressions.ONE)
                .fetchFirst() != null;
    }

    
    @Override
    public Boolean existsBlockBetweenUsers(Long conversationId) {
        Integer result = new JPAQuery<>(entityManager)
                .select(Expressions.ONE)
                .from(userBlock)
                .innerJoin(cpBlocker)
                    .on(userBlock.blocker.id.eq(cpBlocker.user.id))
                .innerJoin(cpBlocked)
                    .on(userBlock.blocked.id.eq(cpBlocked.user.id))
                .where(cpBlocker.conversation.id.eq(conversationId)
                        .and(cpBlocked.conversation.id.eq(conversationId)))
                .fetchFirst();

        return result != null;
    }
}