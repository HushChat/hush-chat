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

package com.platform.software.chat.conversation.readstatus.repository;

import com.platform.software.chat.conversation.readstatus.entity.QConversationReadStatus;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public class ConversationReadStatusQueryRepositoryImpl  implements ConversationReadStatusQueryRepository {
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
