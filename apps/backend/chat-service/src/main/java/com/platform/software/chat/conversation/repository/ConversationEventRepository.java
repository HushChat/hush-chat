package com.platform.software.chat.conversation.repository;

import com.platform.software.chat.conversation.entity.ConversationEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ConversationEventRepository extends JpaRepository<ConversationEvent, Long> {
}
