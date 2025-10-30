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

package com.platform.software.chat.conversation.repository;

import com.platform.software.chat.conversation.dto.ChatSummaryDTO;
import com.platform.software.chat.conversation.dto.ConversationDTO;
import com.platform.software.chat.conversation.dto.ConversationFilterCriteriaDTO;
import com.platform.software.chat.conversation.dto.ConversationMetaDataDTO;
import com.platform.software.chat.conversation.dto.DirectOtherMetaDTO;
import com.platform.software.chat.conversation.entity.Conversation;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;


public interface ConversationQueryRepository {
    Optional<Conversation> findDirectConversationBetweenUsers(Long userId1, Long userId2);
    
    ChatSummaryDTO getChatSummaryForUser(Long userId);

    Page<ConversationDTO> findAllConversationsByUserIdWithLatestMessages(Long userId, ConversationFilterCriteriaDTO conversationFilterCriteria, Pageable pageable);

    ConversationParticipant getOtherParticipantInOneToOneConversationOrThrow(Long conversationId, Long userId);

    List<Conversation> getOneToOneConversationsForCurrentUser(Long userId);

    ConversationMetaDataDTO findConversationMetaData(Long conversationId, Long userId);

    boolean getIsActiveByConversationIdAndUserId(Long conversationId, Long userId);

    Optional<DirectOtherMetaDTO> findDirectOtherMeta(Long conversationId, Long userId);

    Map<Long, Long> findDirectConversationsBatch(Long loggedInUserId, List<Long> targetUserIds);

}
