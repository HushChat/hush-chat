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

package com.platform.software.chat.user.repository;

import com.platform.software.chat.user.entity.ChatUser;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;

import java.util.List;

public class ChatUserQueryRepositoryImpl implements ChatUserQueryRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public List<ChatUser> getAllUsersIgnoringFilters() {
        Query query = entityManager.createNativeQuery(
            "SELECT * FROM chat_user", ChatUser.class);
        return query.getResultList();
    }
}
