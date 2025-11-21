import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { conversationMessageQueryKeys } from "@/constants/queryKeys";
import { usePaginatedQueryWithCursor } from "@/query/usePaginatedQueryWithCursor";
import { useConversationMessages } from "@/hooks/useWebSocketEvents";
import {
  CursorPaginatedResponse,
  getConversationMessagesByCursor,
  getMessagesAroundMessageId,
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
    [userId, conversationId]
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
    queryFn: (params) => getConversationMessagesByCursor(conversationId, params),
    pageSize: PAGE_SIZE,
    enabled: !!conversationId,
  });

  const updateConversationMessagesCache = useCallback(
    (newMessage: IMessage) => {
      queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<IMessage>>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;

          const firstPage = oldData.pages[0];
          const alreadyExists = firstPage.content.some((msg) => msg.id === newMessage.id);
          if (alreadyExists) return oldData;

          const updatedFirstPage = {
            ...firstPage,
            content: [newMessage, ...firstPage.content],
          };

          return {
            ...oldData,
            pages: [updatedFirstPage, ...oldData.pages.slice(1)],
          };
        }
      );
    },
    [queryClient, queryKey]
  );

  const { lastMessage } = useConversationMessages(conversationId);

  useEffect(() => {
    if (!lastMessage) return;
    updateConversationMessagesCache(lastMessage);
  }, [lastMessage, updateConversationMessagesCache]);

  const jumpToMessage = useCallback(
    async (messageId: number) => {
      await getMessagesAroundMessageId(conversationId, messageId);
    },
    [conversationId, queryClient, queryKey]
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
    updateConversationMessagesCache,
  } as const;
}
