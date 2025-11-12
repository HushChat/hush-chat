package com.platform.software.chat.conversation.repository;

import com.platform.software.chat.conversation.entity.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long>, ConversationQueryRepository {
    Optional<Conversation> findByIdAndCreatedById(Long id, Long createdById);

    Conversation findTopByOrderByIdDesc();
}
