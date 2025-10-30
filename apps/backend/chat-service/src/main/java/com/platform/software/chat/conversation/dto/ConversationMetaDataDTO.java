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
import com.platform.software.chat.message.dto.BasicMessageDTO;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationMetaDataDTO {
    private Long id;
    private String name;
    private Boolean isGroup;
    private String imageIndexedName;
    private String signedImageUrl;
    private Boolean isBlocked;
    private Boolean isActive;
    private String description;
    private BasicMessageDTO pinnedMessage;

    public ConversationMetaDataDTO(Conversation conversation) {
        this.id = conversation.getId();
        this.name = conversation.getName();
        this.isGroup = conversation.getIsGroup();
        this.imageIndexedName = conversation.getImageIndexedName();
        this.isBlocked = false;
        this.description = conversation.getDescription();
        this.signedImageUrl = conversation.getSignedImageUrl();
    }
}
