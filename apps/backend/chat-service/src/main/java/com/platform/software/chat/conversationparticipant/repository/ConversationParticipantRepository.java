package com.platform.software.chat.conversationparticipant.repository;

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

@Repository
public interface ConversationParticipantRepository extends JpaRepository<ConversationParticipant, Long>, ConversationParticipantQueryRepository {
    Optional<ConversationParticipant> findByConversationIdAndUser_IdAndConversationDeletedFalse(Long conversationId, Long userId);

    List<ConversationParticipant> findAllByConversationIdAndUser_IdInAndConversationDeletedFalse(Long conversation_id, Collection<Long> userIds);

    Optional<ConversationParticipant> findByConversationIdAndUser_IdAndConversationDeletedFalseAndRoleAndConversation_IsGroup(
        Long conversationId, Long userId, ConversationParticipantRoleEnum role, Boolean isGroup
    );
  
    boolean existsByConversationIdAndUserId(Long conversationId, Long userId);

    Page<ConversationParticipant> findByConversationId(Long conversationId, Pageable pageable);

}
