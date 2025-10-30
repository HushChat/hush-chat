package com.platform.software.chat.message.repository;

import com.platform.software.chat.message.dto.MessageViewDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FavoriteMessageQueryRepository {
    Page<MessageViewDTO> findFavoriteMessagesByUserId(Long userId, Pageable pageable);
}
