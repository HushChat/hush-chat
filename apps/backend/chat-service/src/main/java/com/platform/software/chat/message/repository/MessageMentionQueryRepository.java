package com.platform.software.chat.message.repository;

import com.platform.software.chat.message.entity.MessageMention;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MessageMentionQueryRepository {
    Page<MessageMention> findAllUserMentionsByOthers(Long mentionedUserId, Pageable pageable);
}
