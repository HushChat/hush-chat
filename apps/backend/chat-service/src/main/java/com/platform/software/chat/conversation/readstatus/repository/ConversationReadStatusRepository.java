package com.platform.software.chat.conversation.readstatus.repository;

import com.platform.software.chat.conversation.readstatus.entity.ConversationReadStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationReadStatusRepository extends JpaRepository<ConversationReadStatus, Long>, ConversationReadStatusQueryRepository {
    Optional<ConversationReadStatus> findByConversationIdAndUserId(Long conversationId, Long userId);
}
