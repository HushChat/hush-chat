import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import { ToastUtils } from "@/utils/toastUtils";
import { logError } from "@/utils/logger";

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
  const [isLoadingMessageWindow, setIsLoadingMessageWindow] = useState(false);

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

  const loadMessageWindow = useCallback(
    async (targetMessageId: number) => {
      setIsLoadingMessageWindow(true);

      try {
        await queryClient.cancelQueries({ queryKey });

        const messageWindowResponse = await getMessagesAroundMessageId(
          conversationId,
          targetMessageId
        );

        if (messageWindowResponse.error) {
          ToastUtils.error(messageWindowResponse.error);
          return;
        }

        const paginatedMessageWindow = messageWindowResponse.data;
        if (!paginatedMessageWindow) return;

        const newInfiniteQueryCache: InfiniteData<CursorPaginatedResponse<IMessage>> = {
          pages: [paginatedMessageWindow],
          pageParams: [null],
        };

        queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<IMessage>>>(
          queryKey,
          newInfiniteQueryCache
        );
      } catch (error) {
        logError("jumpToMessage: Failed to load target message window", error);
      } finally {
        setIsLoadingMessageWindow(false);
      }
    },
    [conversationId, queryClient, queryKey]
  );

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

  return {
    conversationMessagesPages: pages,
    isLoadingConversationMessages: isLoading || isLoadingMessageWindow,
    conversationMessagesError: error,
    fetchNextPage: fetchOlder,
    hasNextPage: hasMoreOlder,
    isFetchingNextPage: isFetchingOlder,
    refetchConversationMessages: invalidateQuery,
    refetch,
    updateConversationMessagesCache,
    loadMessageWindow,
  } as const;
}
