package com.platform.software.chat.message.repository;

import com.platform.software.chat.message.entity.MessageMention;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;

@Repository
public interface MessageMentionRepository extends JpaRepository<MessageMention, String> {
    List<MessageMention> findByMessageIdIn(Collection<Long> messageIds);
    Page<MessageMention> findByMentionedUser_Id(Long userId, Pageable pageable);
}
