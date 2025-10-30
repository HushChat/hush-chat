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

package com.platform.software.chat.conversationparticipant.dto;

import com.platform.software.chat.conversationparticipant.entity.ConversationParticipant;
import com.platform.software.chat.conversationparticipant.entity.ConversationParticipantRoleEnum;
import com.platform.software.chat.user.dto.UserViewDTO;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ConversationParticipantViewDTO {
    private Long id;
    private ConversationParticipantRoleEnum role;
    private UserViewDTO user;

    public ConversationParticipantViewDTO(ConversationParticipant conversationParticipant) {
        this.id = conversationParticipant.getId();
        this.role = conversationParticipant.getRole();
    }
}
