package com.platform.software.chat.message.repository;

import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.entity.FavouriteMessage;
import com.platform.software.chat.message.entity.Message;
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
    public Page<Message> findFavoriteMessagesOfUserForConversation(Long conversationId, Long userId, Pageable pageable) {
        QChatUser qSender = new QChatUser("sender");
        QMessage qParentMessage = new QMessage("parentMessage");

        List<Message> results = queryFactory
                .select(qMessage)
                .from(qFavouriteMessage)
                .join(qFavouriteMessage.message, qMessage)
                .join(qMessage.sender, qSender)
                .leftJoin(qMessage.parentMessage, qParentMessage)
                .where(qFavouriteMessage.user.id.eq(userId).and(qFavouriteMessage.conversation.id.eq(conversationId)))
                .orderBy(qFavouriteMessage.createdAt.desc())
                .limit(pageable.getPageSize())
                .offset(pageable.getOffset())
                .fetch();


        Long total = queryFactory
                .select(qFavouriteMessage.count())
                .from(qFavouriteMessage)
                .where(qFavouriteMessage.user.id.eq(userId))
                .fetchOne();
        long totalCount = Objects.requireNonNullElse(total, 0L);

        return new PageImpl<>(results, pageable, totalCount);
    }
}
