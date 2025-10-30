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

import { getConversationById } from "@/apis/conversation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { conversationQueryKeys } from "@/constants/queryKeys";

export const useConversationByIdQuery = (conversationId: number) => {
  const {
    user: { id: userId },
  } = useUserStore();
  const queryClient = useQueryClient();

  const {
    data: conversationAPIResponse,
    isLoading: conversationAPILoading,
    error: conversationAPIError,
  } = useQuery({
    queryKey: conversationQueryKeys.metaDataById(
      Number(userId),
      conversationId,
    ),
    queryFn: () => getConversationById(conversationId),
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  const refetchConversation = () => {
    queryClient.invalidateQueries({
      queryKey: conversationQueryKeys.metaDataById(
        Number(userId),
        conversationId,
      ),
    });
  };

  return {
    conversationAPIResponse,
    conversationAPILoading,
    conversationAPIError,
    refetchConversation,
  };
};
