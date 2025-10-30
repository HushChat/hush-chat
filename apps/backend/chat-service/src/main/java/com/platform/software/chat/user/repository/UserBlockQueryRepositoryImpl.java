/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

package com.platform.software.chat.user.repository;

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
}