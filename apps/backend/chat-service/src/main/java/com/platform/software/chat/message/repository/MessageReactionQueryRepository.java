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

package com.platform.software.chat.message.repository;

import java.util.List;
import java.util.Map;
import com.platform.software.chat.message.dto.MessageReactionSummaryDTO;

public interface MessageReactionQueryRepository {
   public Map<Long, MessageReactionSummaryDTO> findReactionSummaryWithUserReactions(List<Long> messageIds, Long currentUserId);
}
