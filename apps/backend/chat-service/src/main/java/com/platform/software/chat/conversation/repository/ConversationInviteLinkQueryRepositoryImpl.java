package com.platform.software.chat.conversation.repository;

import com.platform.software.chat.conversation.entity.ConversationInviteLink;
import com.platform.software.chat.conversation.entity.QConversationInviteLink;
import com.platform.software.exception.CustomBadRequestException;
import com.querydsl.jpa.impl.JPAQueryFactory;

import java.util.Date;

public class ConversationInviteLinkQueryRepositoryImpl implements ConversationInviteLinkQueryRepository {

    private final QConversationInviteLink qConversationInviteLink = QConversationInviteLink.conversationInviteLink;

    private final JPAQueryFactory jpaQueryFactory;

    public ConversationInviteLinkQueryRepositoryImpl(JPAQueryFactory jpaQueryFactory) {
        this.jpaQueryFactory = jpaQueryFactory;
    }

    @Override
    public ConversationInviteLink findValidInviteLinkByToken(String token){

        ConversationInviteLink conversationInviteLink = jpaQueryFactory
                .selectFrom(qConversationInviteLink)
                .where(
                    qConversationInviteLink.token.eq(token),
                    qConversationInviteLink.isActive.isTrue(),
                    qConversationInviteLink.expiresAt.after(new Date()),
                    qConversationInviteLink.usedCount.lt(qConversationInviteLink.maxUsers)
                )
                .fetchOne();

        if(conversationInviteLink == null){
            throw new CustomBadRequestException("Invalid or expired invite link");
        }

        return conversationInviteLink;
    }
}
