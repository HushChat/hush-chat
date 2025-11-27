package com.platform.software.chat.conversation.repository;

import java.util.List;
import java.util.Optional;

import jakarta.validation.constraints.NotNull;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.platform.software.chat.conversation.entity.Conversation;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Long>, ConversationQueryRepository {
    Optional<Conversation> findByIdAndCreatedById(Long id, Long createdById);
    Conversation findTopByOrderByIdDesc();

    List<Conversation> findAllByIsGroup(@NotNull Boolean isGroup);
}
