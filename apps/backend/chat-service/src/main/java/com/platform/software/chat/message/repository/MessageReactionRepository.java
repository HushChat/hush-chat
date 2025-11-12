package com.platform.software.chat.message.repository;

import com.platform.software.chat.message.entity.MessageReaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MessageReactionRepository extends JpaRepository<MessageReaction, Long>, MessageReactionQueryRepository {
    Optional<MessageReaction> findByMessageIdAndUserId(Long messageId, Long userId);

    Page<MessageReaction> getMessageReactionsByMessage_Id_OrderByReactionType(Long messageId, Pageable pageable);
}
