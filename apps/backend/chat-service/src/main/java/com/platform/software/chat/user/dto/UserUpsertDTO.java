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
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class UserUpsertDTO {

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    private String email;

    @NotBlank(message = "password is required!")
    private String password;

    @NotBlank(message = "username is required!")
    @Pattern(
        regexp = "^[a-zA-Z0-9_]+$",
        message = "username must contain only letters, numbers, and underscores, no spaces or other special characters"
    )
    private String username;

    private String imageIndexedName;

    public ChatUser toChatUser() {
        ChatUser chatUser = new ChatUser();
        chatUser.setFirstName(this.getFirstName());
        chatUser.setLastName(this.getLastName());
        chatUser.setEmail(this.getEmail());
        chatUser.setUsername(this.getUsername());
        chatUser.setImageIndexedName(this.getImageIndexedName());
        return chatUser;
    }
}



