package com.platform.software.chat.conversationparticipant.repository;

import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantFilterCriteriaDTO;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ConversationParticipantQueryRepository {
    List<ConversationDTO> findAllConversationsByUserId(Long userId);

    Optional<ConversationDTO> findConversationByUserIdAndConversationId(Long userId, Long conversationId);

    List<ConversationDTO> findAllConversationByUserIdAndConversationIds(Long userId, Set<Long> conversationIds);

    Optional<ConversationDTO> findConversationById(Long conversationId);

    long updateIsActiveById(Long id, Boolean isActive);

    Page<ConversationDTO> getFavouriteConversationsByUserId(Long userId, Pageable pageable);

    Page<ConversationDTO> findPinnedConversationsByUserId(Long userId, Pageable pageable);

    Page<ConversationDTO> findConversationsByMatchingKeyword(String searchKeyword, Long loggedInUser, Pageable pageable);

    Page<ConversationParticipant> findConversationParticipantsByCriteria(
            Long conversationId,
            Pageable pageable,
            ConversationParticipantFilterCriteriaDTO filterCriteria
    );

    void restoreParticipantsByConversationId(Long conversationId);
}
