package com.platform.software.chat.notification.repository;

import com.platform.software.chat.user.entity.ChatUser;

import java.util.List;

public interface ChatNotificationQueryRepository {
    List<String> findTokensByConversationId(Long conversationId, Long loggedInUserId, boolean withMutedUsers);
    List<String> findNonMutedTokensByUserId(Long userId);
    List<String> findTokensByChatUsers(List<ChatUser> chatUsers, Long conversationId);
}
