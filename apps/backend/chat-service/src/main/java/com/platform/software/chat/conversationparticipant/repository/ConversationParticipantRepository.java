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
