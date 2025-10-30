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

import { ConversationType } from "@/types/chat/types";

const conversationCriteriaMap: Record<ConversationType, () => object> = {
  [ConversationType.ARCHIVED]: () => ({ isArchived: true }),
  [ConversationType.FAVORITES]: () => ({ isFavorite: true }),
  [ConversationType.UNREAD]: () => ({ isUnread: true }),
  [ConversationType.ALL]: () => ({}),
};

const getCriteria = (types: ConversationType | ConversationType[]) => {
  const typeList = Array.isArray(types) ? types : [types];

  return typeList.reduce((criteria, type) => {
    return { ...criteria, ...(conversationCriteriaMap[type]?.() || {}) };
  }, {});
};

export { getCriteria };
