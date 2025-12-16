package com.platform.software.chat.message.repository;

import com.platform.software.chat.message.dto.MessageMentionDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageMentionQueryRepository {
    Page<MessageMentionDTO> findAllUserMentionsByOthers(Long mentionedUserId, Pageable pageable);
}
