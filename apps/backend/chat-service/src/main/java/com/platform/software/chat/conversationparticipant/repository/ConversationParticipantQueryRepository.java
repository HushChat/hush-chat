/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
