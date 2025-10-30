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

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.user.dto.UserViewDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.ZonedDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationOneToOneProfileDTO {
    private UserViewDTO userView;
    private boolean isBlocked;
    private boolean isFavorite;
    private boolean isPinned;
    private ZonedDateTime mutedUntil;

    public ConversationOneToOneProfileDTO(ConversationParticipant conversationParticipant) {
        this.userView = new UserViewDTO(conversationParticipant.getUser());
        this.isFavorite = conversationParticipant.getIsFavorite();
        this.mutedUntil = conversationParticipant.getMutedUntil();
    }
}
