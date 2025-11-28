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
  const [inMessageWindowView, setInMessageWindowView] = useState(false);
  const [targetMessageId, setTargetMessageId] = useState<number | null>(null);

  const queryKey = useMemo(
    () => conversationMessageQueryKeys.messages(Number(userId), conversationId),
    [userId, conversationId]
  );

  useEffect(() => {
    if (previousConversationId.current !== conversationId) {
      queryClient.removeQueries({ queryKey });
      previousConversationId.current = conversationId;
      setInMessageWindowView(false);
      setTargetMessageId(null);
    }
  }, [conversationId, queryKey, queryClient]);

  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQueryWithCursor<IMessage>({
    queryKey,
    queryFn: (params) => getConversationMessagesByCursor(conversationId, params),
    pageSize: PAGE_SIZE,
    enabled: !!conversationId,
    allowForwardPagination: inMessageWindowView,
  });

  const loadMessageWindow = useCallback(
    async (targetMessageIdParam: number) => {
      setInMessageWindowView(true);
      setTargetMessageId(targetMessageIdParam);

      try {
        const messageWindowResponse = await getMessagesAroundMessageId(
          conversationId,
          targetMessageIdParam
        );

        if (messageWindowResponse.error) {
          ToastUtils.error(messageWindowResponse.error);
          setTargetMessageId(null);
          return;
        }

        const paginatedMessageWindow = messageWindowResponse.data;
        if (!paginatedMessageWindow) {
          setTargetMessageId(null);
          return;
        }

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
        setInMessageWindowView(false);
        setTargetMessageId(null);
      }
    },
    [conversationId, queryClient, queryKey]
  );

  const clearTargetMessage = useCallback(() => {
    setTargetMessageId(null);
  }, []);

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
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    refetch,
    invalidateQuery,
    updateConversationMessagesCache,
    loadMessageWindow,
    inMessageWindowView,
    targetMessageId,
    clearTargetMessage,
  } as const;
}
