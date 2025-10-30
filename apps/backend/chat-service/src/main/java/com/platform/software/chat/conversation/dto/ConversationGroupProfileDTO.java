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

package com.platform.software.chat.conversation.dto;

import com.platform.software.chat.conversation.entity.Conversation;
import com.platform.software.chat.conversationparticipant.dto.ConversationParticipantViewDTO;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.domain.Page;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
public class ConversationGroupProfileDTO {
     private ConversationViewDTO conversation;
     private boolean isFavorite;
     private boolean isPinned;
     private ZonedDateTime mutedUntil;
     private long participantCount;
     private boolean isAdmin;
     private boolean isActive;

     public ConversationGroupProfileDTO(
             Conversation conversation,
             ConversationParticipant participant,
             Page<ConversationParticipantViewDTO> conversationParticipants
     ){
        this.conversation = new ConversationViewDTO(conversation);
        this.conversation.setConversationParticipants(conversationParticipants);
        this.isFavorite = participant.getIsFavorite();
        this.isPinned = participant.getIsPinned();
        this.mutedUntil = participant.getMutedUntil();
        this.participantCount = conversationParticipants.getTotalElements();
        this.isAdmin = participant.getRole() == ConversationParticipantRoleEnum.ADMIN;
        this.isActive = participant.getIsActive();
     }
}