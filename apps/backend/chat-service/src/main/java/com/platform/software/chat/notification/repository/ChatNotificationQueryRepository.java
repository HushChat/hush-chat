package com.platform.software.chat.notification.repository;

import java.util.List;

public interface ChatNotificationQueryRepository {
    List<String> findTokensByConversationId(Long conversationId, Long loggedInUserId, boolean withMutedUsers);
    List<String> findNonMutedTokensByUserId(Long userId);
}
