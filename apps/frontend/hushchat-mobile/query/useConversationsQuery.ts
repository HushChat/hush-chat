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

import { IConversation } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import {
  getAllConversations,
  ConversationFilterCriteria,
} from "@/apis/conversation";
import {
  OffsetPaginatedQueryResult,
  usePaginatedQueryWithOffset,
} from "@/query/usePaginatedQueryWithOffset";
import { useConversationsNotifications } from "@/hooks/useWebSocketEvents";
import { useEffect } from "react";
import { appendToOffsetPaginatedCache } from "@/query/config/appendToOffsetPaginatedCache";
import { useQueryClient } from "@tanstack/react-query";
import { conversationQueryKeys } from "@/constants/queryKeys";

const PAGE_SIZE = 20;

export function useConversationsQuery(
  criteria: ConversationFilterCriteria = {},
  initialOffset: number = 0,
): {
  conversationsPages: OffsetPaginatedQueryResult<IConversation>["pages"];
  isLoadingConversations: boolean;
  conversationsError: Error | null;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetchConversations: () => void;
  refetch: () => Promise<unknown>;
} {
  const {
    user: { id: userId },
  } = useUserStore();
  const queryClient = useQueryClient();

  const { notificationReceivedConversation } = useConversationsNotifications();
  useEffect(() => {
    if (notificationReceivedConversation) {
      appendToOffsetPaginatedCache<IConversation>(
        queryClient,
        conversationQueryKeys.allConversations(Number(userId), criteria),
        notificationReceivedConversation,
        {
          getId: (m) => m?.id,
          pageSize: PAGE_SIZE,
          getPageItems: (p) => p?.content,
          setPageItems: (p, items) => ({ ...p, content: items }),
          dedupeAcrossPages: true,
        },
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationReceivedConversation, queryClient, userId]);

  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQueryWithOffset<IConversation>({
    queryKey: conversationQueryKeys.allConversations(Number(userId), criteria),
    queryFn: (pageParam: number, pageSize: number) =>
      getAllConversations(criteria, pageParam, pageSize),
    pageSize: PAGE_SIZE,
    initialOffset,
  });

  return {
    conversationsPages: pages,
    isLoadingConversations: isLoading,
    conversationsError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetchConversations: invalidateQuery,
    refetch,
  };
}
