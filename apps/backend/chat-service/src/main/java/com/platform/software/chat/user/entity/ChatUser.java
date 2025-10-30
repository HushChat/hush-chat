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

package com.platform.software.chat.user.entity;

import com.platform.software.chat.message.entity.FavouriteMessage;
import com.platform.software.common.model.AuditModel;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import jakarta.persistence.*;
import org.hibernate.annotations.Where;

import java.util.Set;


@Entity
@Setter
@Getter
// TODO: @Where(clause = "active = true AND deleted = false")
public class ChatUser extends AuditModel{

    @Id
    @GeneratedValue(generator = "chat_user_generator")
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String username;

    @NotBlank
    private String firstName;

    @NotBlank
    private String lastName;

    @NotBlank
    private String email;

    @NotNull
    private Boolean active = false;

    @NotNull
    private Boolean deleted = false;

    private String imageIndexedName;

    @Transient
    private String signedImageUrl;

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private Set<FavouriteMessage> favouriteMessages;
}
