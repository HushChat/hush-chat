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

import com.platform.software.chat.user.entity.ChatUser;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor

public class DirectOtherMetaDTO {
    private Long otherUserId;
    private String firstName;
    private String lastName;
    private String imageIndexedName;
    private boolean blocked;
    private String signedImageUrl;

    public DirectOtherMetaDTO(ChatUser otherUser, boolean blocked) {
        this.otherUserId = otherUser.getId();
        this.firstName = otherUser.getFirstName();
        this.lastName = otherUser.getLastName();
        this.imageIndexedName = otherUser.getImageIndexedName();
        this.blocked = blocked;
        this.signedImageUrl = otherUser.getSignedImageUrl();
    }

    public String getFullName() {
        String f = firstName == null ? "" : firstName;
        String l = lastName == null ? "" : lastName;
        String full = (f + " " + l).trim();
        return full.isEmpty() ? null : full;
    }
}