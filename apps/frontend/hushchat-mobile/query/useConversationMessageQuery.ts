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
import type { IMessage, IConversation } from "@/types/chat/types";
import { OffsetPaginatedResponse } from "@/query/usePaginatedQueryWithOffset";
import { ToastUtils } from "@/utils/toastUtils";
import { logError } from "@/utils/logger";
import { separatePinnedItems } from "@/query/config/appendToOffsetPaginatedCache";

const PAGE_SIZE = 20;

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
      queryClient.invalidateQueries({ queryKey });
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
      setTargetMessageId(null);

      setTimeout(async () => {
        setInMessageWindowView(true);

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

          setTargetMessageId(targetMessageIdParam);
        } catch (error) {
          logError("jumpToMessage: Failed to load target message window", error);
          setInMessageWindowView(false);
          setTargetMessageId(null);
        }
      }, 0);
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

              const otherConversations = page.content.filter((c) => c.id !== conversationId);
              const { pinned, unpinned } = separatePinnedItems(
                otherConversations,
                (c) => c.pinnedByLoggedInUser
              );

              let newContent: IConversation[];

              if (updatedConversation.pinnedByLoggedInUser) {
                newContent = [updatedConversation, ...pinned, ...unpinned];
              } else {
                newContent = [...pinned, updatedConversation, ...unpinned];
              }

              return { ...page, content: newContent };
            }),
          };
        }
      );
    },
    [queryClient, conversationId, userId]
  );

  const replaceTempMessage = useCallback(
    (temporaryMessageId: number, serverMessageId: number) => {
      queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<IMessage>>>(
        queryKey,
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData.pages.map((page) => ({
              ...page,
              content: page.content.map((msg) =>
                msg.id === temporaryMessageId ? { ...msg, id: serverMessageId } : msg
              ),
            })),
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
    updateConversationsListCache(lastMessage);
  }, [lastMessage, updateConversationMessagesCache, updateConversationsListCache]);

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
    updateConversationsListCache,
    replaceTempMessage,
    loadMessageWindow,
    inMessageWindowView,
    targetMessageId,
    clearTargetMessage,
  } as const;
}
