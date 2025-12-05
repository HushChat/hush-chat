package com.platform.software.chat.message.repository;

import com.platform.software.chat.message.dto.MessageViewDTO;
import com.platform.software.chat.message.entity.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FavoriteMessageQueryRepository {
    Page<Message> findFavoriteMessagesOfUserForConversation(Long conversationId, Long userId, Pageable pageable);
}
