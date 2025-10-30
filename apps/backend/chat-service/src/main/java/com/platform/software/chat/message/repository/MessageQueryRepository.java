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

package com.platform.software.chat.message.repository;

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.controller.external.IdBasedPageRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import com.platform.software.chat.message.entity.Message;

import java.util.Optional;

public interface MessageQueryRepository {
    Message saveMessageWthSearchVector(Message message);

    Optional<Message> findDeletableMessage(Long messageId, Long loggedInUserId);

    Page<Message> findMessagesAndAttachments(Long conversationId, IdBasedPageRequest idBasedPageRequest, ConversationParticipant participant);
}
