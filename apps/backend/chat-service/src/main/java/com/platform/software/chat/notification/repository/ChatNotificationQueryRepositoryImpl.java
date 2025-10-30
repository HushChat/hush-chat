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

package com.platform.software.chat.notification.repository;

import com.platform.software.chat.conversationparticipant.entity.QConversationParticipant;
import com.platform.software.chat.notification.entity.QChatNotification;
import com.platform.software.chat.user.entity.QChatUser;
import com.platform.software.config.cache.CacheNames;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import org.springframework.cache.annotation.Cacheable;

import java.time.ZonedDateTime;
import java.util.List;

public class ChatNotificationQueryRepositoryImpl implements ChatNotificationQueryRepository {

    private final JPAQueryFactory jpaQueryFactory;

    public ChatNotificationQueryRepositoryImpl(JPAQueryFactory jpaQueryFactory) {
        this.jpaQueryFactory = jpaQueryFactory;
    }

    private static final QConversationParticipant qConversationParticipant = QConversationParticipant.conversationParticipant;
    private static final QChatUser qChatUser = QChatUser.chatUser;
    private static final QChatNotification qChatNotification = QChatNotification.chatNotification;

    /**
     * Retrieves all distinct notification tokens of active participants in a given conversation.
     * Optionally includes muted users based on the includeMutedUsers flag.
     * The token of the logged-in user is always excluded.
     *
     * @param conversationId the unique identifier of the conversation
     * @param loggedInUserId the ID of the currently logged-in user to be excluded from results
     * @param includeMutedUsers if true, includes muted participants;
     *                          if false, excludes them
     * @return a list of distinct notification tokens of conversation participants
     */
    @Override
    public List<String> findTokensByConversationId(Long conversationId, Long loggedInUserId, boolean includeMutedUsers) {

        BooleanBuilder whereCondition = new BooleanBuilder();
        whereCondition.and(qConversationParticipant.conversation.id.eq(conversationId));
        whereCondition.and(qConversationParticipant.isActive.isTrue());
        whereCondition.and(qChatUser.id.ne(loggedInUserId));

        if (!includeMutedUsers) {
            whereCondition.and(
                    qConversationParticipant.mutedUntil.isNull()
                            .or(qConversationParticipant.mutedUntil.lt(ZonedDateTime.now()))
            );
        }

        return jpaQueryFactory
                .select(qChatNotification.token)
                .distinct()
                .from(qConversationParticipant)
                .join(qConversationParticipant.user, qChatUser)
                .join(qChatNotification).on(qChatNotification.chatUser.id.eq(qChatUser.id))
                .where(whereCondition)
                .fetch();
    }

    /**
     * Retrieves all active notification tokens for the specified user,
     * excluding those muted due to an active mute period.
     *
     * @param userId userId
     * @return available tokens of given userId
     */
    @Override
    public List<String> findNonMutedTokensByUserId(Long userId){
        return jpaQueryFactory
                .select(qChatNotification.token)
                .distinct()
                .from(qChatNotification)
                .join(qChatNotification.chatUser, qChatUser)
                .join(qConversationParticipant)
                .on(qConversationParticipant.user.id.eq(qChatUser.id))
                .where(
                        qChatUser.id.eq(userId)
                                .and(
                                        qConversationParticipant.mutedUntil.isNull()
                                                .or(qConversationParticipant.mutedUntil.lt(ZonedDateTime.now()))
                                )
                )
                .fetch();
    }
}
