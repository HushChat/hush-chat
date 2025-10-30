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

import { useCallback } from "react";
import { ConversationFilterCriteria } from "@/apis/conversation";
import { ToastUtils } from "@/utils/toastUtils";
import { useToggleConversationFavoriteMutation } from "@/query/patch/queries";
import { useUserStore } from "@/store/user/useUserStore";

export function useConversationFavorites(
  conversationId: number,
  criteria: ConversationFilterCriteria,
) {
  const {
    user: { id: userId },
  } = useUserStore();
  const toggleFavorite = useToggleConversationFavoriteMutation({
    userId: Number(userId),
    conversationId,
    criteria,
  });

  const handleToggleFavorites = useCallback(
    async (conversationId: number) => {
      try {
        toggleFavorite.mutate(conversationId);
      } catch {
        ToastUtils.error("Failed to update favorites!");
      }
    },
    [toggleFavorite],
  );

  return { handleToggleFavorites };
}
