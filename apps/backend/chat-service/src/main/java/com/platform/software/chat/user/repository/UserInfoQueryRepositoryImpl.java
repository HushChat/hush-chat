package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.dto.UserProfileDTO;
import com.platform.software.chat.user.entity.QChatUser;
import com.platform.software.chat.user.entity.QChatUserInfo;
import com.platform.software.exception.CustomBadRequestException;
import com.querydsl.core.types.Projections;
import com.querydsl.jpa.impl.JPAQueryFactory;

public class UserInfoQueryRepositoryImpl implements UserInfoQueryRepository {

    private final JPAQueryFactory jpaQueryFactory;

    private static final QChatUser chatUser = QChatUser.chatUser;
    private static final QChatUserInfo chatUserInfo = QChatUserInfo.chatUserInfo;

    public UserInfoQueryRepositoryImpl(JPAQueryFactory jpaQueryFactory) {
        this.jpaQueryFactory = jpaQueryFactory;
    }

    @Override
    public UserProfileDTO getProfileById(Long id) {
        UserProfileDTO userPublicProfile = jpaQueryFactory
                .select(Projections.constructor(
                        UserProfileDTO.class,
                        chatUser.id,
                        chatUser.firstName,
                        chatUser.lastName,
                        chatUser.username,
                        chatUser.email,
                        chatUser.imageIndexedName,
                        chatUserInfo.contactNumber,
                        chatUserInfo.address,
                        chatUserInfo.designation
                ))
                .from(chatUser)
                .leftJoin(chatUserInfo)
                .on(chatUserInfo.chatUser.eq(chatUser))
                .where(
                        chatUser.id.eq(id),
                        chatUser.active.isTrue(),
                        chatUser.deleted.isFalse()
                )
                .fetchOne();

        if (userPublicProfile == null) {
            throw new CustomBadRequestException("User not found with id: " + id);
        }

        return userPublicProfile;
    }

}
