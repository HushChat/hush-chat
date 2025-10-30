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

package com.platform.software.chat.conversation.readstatus.service;

import com.platform.software.chat.conversation.readstatus.dto.MessageLastSeenRequestDTO;
import com.platform.software.chat.conversation.readstatus.entity.ConversationReadStatus;
import com.platform.software.chat.conversation.readstatus.repository.ConversationReadStatusRepository;
import com.platform.software.chat.conversation.service.ConversationUtilService;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.message.service.MessageService;
import com.platform.software.exception.CustomBadRequestException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class ConversationReadStatusService {
    Logger logger = LoggerFactory.getLogger(ConversationReadStatusService.class);

    private final ConversationReadStatusRepository conversationReadStatusRepository;
    private final MessageService messageService;
    private final ConversationUtilService conversationUtilService;

    public ConversationReadStatusService(
        ConversationReadStatusRepository conversationReadStatusRepository,
        MessageService messageService,
        ConversationUtilService conversationUtilService
    ) {
        this.conversationReadStatusRepository = conversationReadStatusRepository;
        this.messageService = messageService;
        this.conversationUtilService = conversationUtilService;
    }

    public void setConversationLastSeenMessage(Long conversationId, Long loggedInUserId, MessageLastSeenRequestDTO messageLastSeenRequestDTO) {
        ConversationParticipant conversationParticipant = conversationUtilService.getConversationParticipantOrThrow(conversationId, loggedInUserId);
        Message message = messageService.getMessageOrThrow(conversationId, messageLastSeenRequestDTO.getMessageId());

        ConversationReadStatus updatingStatus = conversationReadStatusRepository
            .findByConversationIdAndUserId(conversationId, loggedInUserId)
            .orElseGet(() -> {
                ConversationReadStatus newStatus = new ConversationReadStatus();
                newStatus.setUser(conversationParticipant.getUser());
                newStatus.setConversation(conversationParticipant.getConversation());
                return newStatus;
            });

        // Early return if the message is already set to avoid unnecessary updates
        if (updatingStatus.getMessage() != null &&
            updatingStatus.getMessage().getId().equals(message.getId())) {
            return;
        }

        updatingStatus.setMessage(message);

        try {
            conversationReadStatusRepository.save(updatingStatus);
        } catch (Exception exception) {
            logger.error("failed set message as read: {}", messageLastSeenRequestDTO.getMessageId(), exception);
            throw new CustomBadRequestException("Failed to mark as read");
        }
    }

    public Message getLastSeenMessageOrNull(Long conversationId, Long loggedInUserId) {
        return conversationReadStatusRepository.findLastSeenMessageIdByConversationIdAndUserId(conversationId, loggedInUserId)
                .map(lastSeenMessageId -> messageService.getMessageOrThrow(conversationId, lastSeenMessageId))
                .orElse(null);
    }
}

