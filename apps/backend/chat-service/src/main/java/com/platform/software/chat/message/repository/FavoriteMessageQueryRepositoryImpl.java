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

package com.platform.software.chat.message.repository;

import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.entity.FavouriteMessage;
import com.platform.software.chat.message.entity.QFavouriteMessage;
import com.platform.software.chat.message.entity.QMessage;
import com.platform.software.chat.user.entity.QChatUser;
import com.querydsl.core.Tuple;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Repository
public class FavoriteMessageQueryRepositoryImpl implements FavoriteMessageQueryRepository {
    private final JPAQueryFactory queryFactory;
    private final QFavouriteMessage qFavouriteMessage = QFavouriteMessage.favouriteMessage;
    private final QMessage qMessage = QMessage.message;

    public FavoriteMessageQueryRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public Page<MessageViewDTO> findFavoriteMessagesByUserId(Long userId, Pageable pageable) {
        QChatUser qSender = new QChatUser("sender");
        QMessage qParentMessage = new QMessage("parentMessage");

        List<Tuple> results = queryFactory
                .select(
                        qMessage.id,
                        qSender.id,
                        qParentMessage.id,
                        qMessage.messageText,
                        qMessage.createdAt,
                        qFavouriteMessage.createdAt
                )
                .distinct()
                .from(qFavouriteMessage)
                .join(qFavouriteMessage.message, qMessage)
                .join(qMessage.sender, qSender)
                .leftJoin(qMessage.parentMessage, qParentMessage)
                .where(qFavouriteMessage.user.id.eq(userId))
                .orderBy(qFavouriteMessage.createdAt.desc())
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .fetch();

        List<MessageViewDTO> messageDTOs = results.stream()
                .map(tuple -> {
                    MessageViewDTO dto = new MessageViewDTO();
                    dto.setId(tuple.get(qMessage.id));
                    dto.setSenderId(tuple.get(qSender.id));
                    dto.setMessageText(tuple.get(qMessage.messageText));
                    dto.setCreatedAt(tuple.get(qMessage.createdAt));
                    return dto;
                })
                .collect(Collectors.toList());

        Long total = queryFactory
                .select(qFavouriteMessage.count())
                .from(qFavouriteMessage)
                .where(qFavouriteMessage.user.id.eq(userId))
                .fetchOne();
        long totalCount = Objects.requireNonNullElse(total, 0L);

        return new PageImpl<>(messageDTOs, pageable, totalCount);
    }
}
