import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { conversationMessageQueryKeys } from "@/constants/queryKeys";
import { usePaginatedQueryWithCursor } from "@/query/usePaginatedQueryWithCursor";
import { useConversationMessages } from "@/hooks/useWebSocketEvents";
import { CursorPaginatedResponse, getConversationMessagesByCursor } from "@/apis/conversation";
import type { IMessage, IConversation } from "@/types/chat/types";
import { OffsetPaginatedResponse } from "@/query/usePaginatedQueryWithOffset";

const PAGE_SIZE = 20;

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

          const updatedFirstPage = { ...firstPage, content: [newMessage, ...firstPage.content] };
          return { ...oldData, pages: [updatedFirstPage, ...oldData.pages.slice(1)] };
        }
      );
    },
    [queryClient, queryKey]
  );

  const updateConversationsListCache = useCallback(
    (newMessage: IMessage) => {
      queryClient.setQueriesData<InfiniteData<OffsetPaginatedResponse<IConversation>>>(
        { queryKey: ["conversations", userId] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => {
              const conversationIndex = page.content.findIndex((c) => c.id === conversationId);

              if (conversationIndex === -1) return page;

              const updatedConversation: IConversation = {
                ...page.content[conversationIndex],
                messages: [newMessage],
              };

              const newContent = [
                updatedConversation,
                ...page.content.filter((c) => c.id !== conversationId),
              ];

              return { ...page, content: newContent };
            }),
          };
        }
      );
    },
    [queryClient, conversationId, userId]
  );

  const { lastMessage } = useConversationMessages(conversationId);

  useEffect(() => {
    if (!lastMessage) return;
    updateConversationMessagesCache(lastMessage);
    updateConversationsListCache(lastMessage);
  }, [lastMessage, updateConversationMessagesCache, updateConversationsListCache]);

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
    updateConversationsListCache,
  } as const;
}
