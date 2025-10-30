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

import com.platform.software.chat.conversation.entity.QConversation;
import com.platform.software.chat.conversationparticipant.entity.QConversationParticipant;
import com.platform.software.chat.user.dto.UserFilterCriteriaDTO;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.entity.QChatUser;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.JPAExpressions;
import com.querydsl.jpa.impl.JPAQuery;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public class UserQueryRepositoryImpl implements UserQueryRepository {
    private final JPAQueryFactory queryFactory;
    private static final QChatUser chatUser = QChatUser.chatUser;
    private static final QConversation conversation = QConversation.conversation;
    private static final QConversationParticipant  conversationParticipant = QConversationParticipant.conversationParticipant;

    public UserQueryRepositoryImpl(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    @Override
    public Page<ChatUser> findAllUsersByCriteria(Pageable pageable, UserFilterCriteriaDTO userFilterCriteriaDTO, Long loggedInUserId) {

        BooleanBuilder where = new BooleanBuilder();
        where.and(chatUser.id.ne(loggedInUserId));

        //TODO: Refactor this and move it to full text search
        if(userFilterCriteriaDTO.getKeyword() != null && !userFilterCriteriaDTO.getKeyword().isEmpty()) {
            String keyword = userFilterCriteriaDTO.getKeyword().trim();
            String[] keywordParts = keyword.split("\\s+");

            BooleanBuilder allWordsBuilder = new BooleanBuilder();

            for (String part : keywordParts) {
                allWordsBuilder.and(
                        chatUser.firstName.containsIgnoreCase(part)
                                .or(chatUser.lastName.containsIgnoreCase(part))
                );
            }

            where.and(allWordsBuilder);

        }

        if (userFilterCriteriaDTO.getExcludeUsersInConversationId() != null) {
            where.and(chatUser.id.notIn(
                    JPAExpressions.select(conversationParticipant.user.id)
                            .from(conversationParticipant)
                            .where(conversationParticipant.conversation.id.eq(userFilterCriteriaDTO.getExcludeUsersInConversationId()))
                            .where(conversationParticipant.isActive.eq(true))
            ));
        }

        where.and(chatUser.active.eq(true))
                .and(chatUser.deleted.eq(false));

        JPAQuery<ChatUser> query = queryFactory.selectFrom(chatUser)
                .where(where)
                .orderBy(chatUser.firstName.asc(), chatUser.lastName.asc())
                .offset(pageable.getOffset())
                .limit(pageable.getPageSize());

        JPAQuery<Long> countQuery = queryFactory.select(chatUser.id.count()).from(chatUser).where(where);

        List<ChatUser> users = query.fetch();
        Long total = countQuery.fetchOne();

        return new PageImpl<>(users, pageable, total != null ? total : 0L);
    }
}
