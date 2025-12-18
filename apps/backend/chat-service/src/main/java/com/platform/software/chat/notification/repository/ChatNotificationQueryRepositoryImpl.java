package com.platform.software.chat.notification.repository;

import com.platform.software.chat.conversationparticipant.entity.QConversationParticipant;
import com.platform.software.chat.notification.entity.QChatNotification;
import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.chat.user.entity.QChatUser;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;

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
        whereCondition.and(qConversationParticipant.notifyOnMentionsOnly.isFalse());
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

    /**
     * Retrieves device tokens for the given chat users.
     *
     * @param chatUsers list of chat users
     * @return a list of device tokens associated with the given chat users.
     *         Returns an empty list if no tokens are found.
     */
    @Override
    public List<String> findTokensByChatUsers(List<ChatUser> chatUsers, Long conversationId) {
        return jpaQueryFactory
                .select(qChatNotification.token)
                .from(qConversationParticipant)
                .join(qConversationParticipant.user, qChatUser)
                .join(qChatNotification).on(qChatNotification.chatUser.id.eq(qChatUser.id))
                .where(qChatUser.in(chatUsers)
                        .and(qConversationParticipant.conversation.id.eq(conversationId))
                        .and(qConversationParticipant.isActive.isTrue())
                        .and(qConversationParticipant.mutedUntil.isNull()
                                .or(qConversationParticipant.mutedUntil.lt(ZonedDateTime.now())))
                )
                .fetch();
    }
}
