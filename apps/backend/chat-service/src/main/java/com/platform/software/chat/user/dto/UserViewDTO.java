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

package com.platform.software.chat.user.dto;

import com.platform.software.chat.user.entity.ChatUser;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserViewDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String username;
    private String email;
    private String signedImageUrl;

    public UserViewDTO(ChatUser user) {
        this.setId(user.getId());
        this.setFirstName(user.getFirstName());
        this.setLastName(user.getLastName());
        this.setEmail(user.getEmail());
        this.setUsername(user.getUsername());
        this.setSignedImageUrl(user.getSignedImageUrl());
    }

    public UserViewDTO(Long id, String firstName, String lastName, String signedImageUrl) {
        this.setId(id);
        this.setFirstName(firstName);
        this.setLastName(lastName);
        this.setSignedImageUrl(signedImageUrl);
    }
}
