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

package com.platform.software.chat.notification.entity;

import com.platform.software.chat.user.entity.ChatUser;
import com.platform.software.common.model.AuditModel;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Setter
@Getter
public class ChatNotification extends AuditModel {
    @Id
    @GeneratedValue(generator = "device_token_generator")
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chat_user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ChatUser chatUser;

    @NotNull
    @Column(unique = true)
    private String token;

    @NotNull
    @Enumerated(EnumType.STRING)
    private DeviceType platform;
}
