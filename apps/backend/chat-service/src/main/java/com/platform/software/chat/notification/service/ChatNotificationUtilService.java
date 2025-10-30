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

package com.platform.software.chat.notification.service;

import com.platform.software.chat.message.entity.Message;
import com.platform.software.chat.notification.repository.ChatNotificationRepository;
import com.platform.software.config.cache.CacheNames;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ChatNotificationUtilService {

    public String getNotificationTitle(Message message) {
        boolean isGroup = message.getConversation().getIsGroup();
        if (isGroup) {
            return message.getConversation().getName();
        }
        return message.getSender().getFirstName() + " " + message.getSender().getLastName();
    }
}
