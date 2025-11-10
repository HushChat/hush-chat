import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { conversationMessageQueryKeys } from "@/constants/queryKeys";
import { useConversationMessages } from "@/hooks/useWebSocketEvents";
import { CursorPaginatedResponse, getConversationMessagesByCursor } from "@/apis/conversation";
import type { IMessage } from "@/types/chat/types";
import { usePaginatedQueryWithCursor } from "@/query/usePaginatedQueryWithCursor";

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
    fetchNewer,
    hasMoreOlder,
    hasMoreNewer,
    isFetchingOlder,
    isFetchingNewer,
    refetch,
    setJumping,
    invalidateQuery,
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
      try {
        setJumping(true);

        const response = await getConversationMessagesByCursor(conversationId, {
          beforeId: messageId,
          size: PAGE_SIZE,
        });

        queryClient.setQueryData(queryKey, {
          pages: [response.data],
          pageParams: [{ beforeId: messageId }],
        });
      } finally {
        setJumping(false);
      }
    },
    [conversationId, queryClient, queryKey, setJumping]
  );

  return {
    conversationMessagesPages: pages,
    isLoadingConversationMessages: isLoading,
    conversationMessagesError: error,
    fetchNextPage: fetchOlder,
    hasNextPage: hasMoreOlder,
    isFetchingNextPage: isFetchingOlder,
    refetchConversationMessages: invalidateQuery,
    fetchPreviousPage: fetchNewer,
    hasPreviousPage: hasMoreNewer,
    isFetchingPreviousPage: isFetchingNewer,
    refetch,
    jumpToMessage,
    updateConversationMessagesCache,
  } as const;
}
