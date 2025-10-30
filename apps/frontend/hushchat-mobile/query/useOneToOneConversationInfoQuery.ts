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

import { getOtherParticipantProfile } from "@/apis/conversation";
import { oneToOneChatInfo } from "@/types/chat/types";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { conversationQueryKeys } from "@/constants/queryKeys";

export function useOneToOneConversationInfoQuery(conversationId: number): {
  conversationInfo: oneToOneChatInfo | undefined;
  isLoadingConversationInfo: boolean;
  conversationInfoError: Error | null;
  refetch: () => Promise<unknown>;
} {
  const {
    user: { id: userId },
  } = useUserStore();

  const { data, isLoading, error, refetch } = useQuery<oneToOneChatInfo>({
    queryKey: conversationQueryKeys.participantProfileInfo(
      Number(userId),
      conversationId,
    ),
    queryFn: () => getOtherParticipantProfile(conversationId),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  return {
    conversationInfo: data,
    isLoadingConversationInfo: isLoading,
    conversationInfoError: error,
    refetch,
  };
}
