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

import com.platform.software.chat.message.entity.Message;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class BasicMessageDTO {
    private Long id;
    private Long senderId;
    private String senderFirstName;
    private String senderLastName;
    private String messageText;
    private Boolean isUnsend;

    public BasicMessageDTO(Message message) {
        this.id = message.getId();
        this.senderId = message.getSender().getId();
        this.senderFirstName = message.getSender().getFirstName();
        this.senderLastName = message.getSender().getLastName();
        this.messageText = message.getMessageText();
        this.isUnsend = message.getIsUnsend();
    }
}
