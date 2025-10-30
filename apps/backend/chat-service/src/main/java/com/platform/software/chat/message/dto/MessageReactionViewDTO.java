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

package com.platform.software.chat.message.dto;

import com.platform.software.chat.message.entity.MessageReaction;
import com.platform.software.chat.message.entity.ReactionTypeEnum;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class MessageReactionViewDTO {
    private Long id;
    private ReactionTypeEnum reactionType;
    private String name;

    public MessageReactionViewDTO(MessageReaction messageReaction){
        this.id = messageReaction.getId();
        this.reactionType = messageReaction.getReactionType();
        this.name = messageReaction.getUser().getFirstName() + " " + messageReaction.getUser().getLastName();
    }
}
