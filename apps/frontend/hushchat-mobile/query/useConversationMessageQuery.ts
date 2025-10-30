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

import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { conversationMessageQueryKeys } from "@/constants/queryKeys";
import { usePaginatedQueryWithCursor } from "@/query/usePaginatedQueryWithCursor";
import { useConversationMessages } from "@/hooks/useWebSocketEvents";
import {
  CursorPaginatedResponse,
  getConversationMessagesByCursor,
} from "@/apis/conversation";
import type { IMessage } from "@/types/chat/types";

const PAGE_SIZE = 20;

/**
 * Hook: useConversationMessagesQuery
 * Handles fetching + caching + live updating of conversation messages
 */
export function useConversationMessagesQuery(conversationId: number) {
  const {
    user: { id: userId },
  } = useUserStore();

  const queryClient = useQueryClient();
  const previousConversationId = useRef<number | null>(null);

  const queryKey = useMemo(
    () => conversationMessageQueryKeys.messages(Number(userId), conversationId),
    [userId, conversationId],
  );

  useEffect(() => {
    if (previousConversationId.current !== conversationId) {
      queryClient.removeQueries({ queryKey });
      previousConversationId.current = conversationId;
    }
  }, [conversationId, queryKey, queryClient]);

  const {
    pages,
    isLoading,
    error,
    fetchOlder,
    hasMoreOlder,
    isFetchingOlder,
    invalidateQuery,
    refetch,
  } = usePaginatedQueryWithCursor<IMessage>({
    queryKey,
    queryFn: (params) =>
      getConversationMessagesByCursor(conversationId, params),
    pageSize: PAGE_SIZE,
    enabled: !!conversationId,
  });

  const { lastMessage } = useConversationMessages(conversationId);

  useEffect(() => {
    if (!lastMessage) return;

    queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<IMessage>>>(
      queryKey,
      (oldData) => {
        if (!oldData) return undefined;

        const firstPageMessages = oldData.pages[0]?.content ?? [];

        if (firstPageMessages.some((msg) => msg.id === lastMessage.id)) {
          return oldData;
        }

        const newFirstPage = {
          ...oldData.pages[0],
          content: [lastMessage, ...firstPageMessages],
        };

        return {
          ...oldData,
          pages: [newFirstPage, ...oldData.pages.slice(1)],
        };
      },
    );
  }, [lastMessage, queryClient, queryKey]);

  const jumpToMessage = useCallback(
    async (messageId: number) => {
      const response = await getConversationMessagesByCursor(conversationId, {
        beforeId: messageId,
        size: PAGE_SIZE,
      });

      queryClient.setQueryData(queryKey, {
        pages: [response.data],
        pageParams: [{ beforeId: messageId }],
      });
    },
    [conversationId, queryClient, queryKey],
  );

  return {
    conversationMessagesPages: pages,
    isLoadingConversationMessages: isLoading,
    conversationMessagesError: error,
    fetchNextPage: fetchOlder,
    hasNextPage: hasMoreOlder,
    isFetchingNextPage: isFetchingOlder,
    refetchConversationMessages: invalidateQuery,
    refetch,
    jumpToMessage,
  } as const;
}
