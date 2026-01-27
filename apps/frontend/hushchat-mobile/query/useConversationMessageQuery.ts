import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { conversationMessageQueryKeys } from "@/constants/queryKeys";
import { usePaginatedQueryWithCursor } from "@/query/usePaginatedQueryWithCursor";
import { eventBus } from "@/services/eventBus";
import { CONVERSATION_EVENTS } from "@/constants/ws/webSocketEventKeys";
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
import { skipRetryOnAccessDenied } from "@/utils/apiErrorUtils";

const PAGE_SIZE = 20;

export function useConversationMessagesQuery(
  conversationId: number,
  options?: { enabled?: boolean }
) {
  const {
    user: { id: userId },
  } = useUserStore();

  const queryClient = useQueryClient();
  const previousConversationId = useRef<number | null>(null);
  const [inMessageWindowView, setInMessageWindowView] = useState(false);
  const [targetMessageId, setTargetMessageId] = useState<number | null>(null);
  const [shouldHighlight, setShouldHighlight] = useState<boolean>(false);
  const blockAutoFetchRef = useRef<boolean>(false);

  const queryKey = useMemo(
    () => conversationMessageQueryKeys.messages(Number(userId), conversationId),
    [userId, conversationId]
  );

  useEffect(() => {
    if (previousConversationId.current !== conversationId) {
      previousConversationId.current = conversationId;
      setInMessageWindowView(false);
      setTargetMessageId(null);
      blockAutoFetchRef.current = false;
    }
  }, [conversationId]);

  const {
    pages,
    isLoading,
    error,
    fetchNextPage: originalFetchNextPage,
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
    enabled: !!conversationId && options?.enabled,
    allowForwardPagination: inMessageWindowView,
    retry: skipRetryOnAccessDenied,
    refetchOnMount: false,
  });

  const fetchNextPage = useCallback(async () => {
    if (blockAutoFetchRef.current) {
      return;
    }
    return originalFetchNextPage();
  }, [originalFetchNextPage]);

  const loadMessageWindow = useCallback(
    async (targetMessageIdParam: number, highlight: boolean = true) => {
      setTargetMessageId(null);
      setShouldHighlight(false);
      blockAutoFetchRef.current = true;

      try {
        setInMessageWindowView(true);

        const messageWindowResponse = await getMessagesAroundMessageId(
          conversationId,
          targetMessageIdParam
        );

        if (messageWindowResponse.error) {
          ToastUtils.error(messageWindowResponse.error);
          setTargetMessageId(null);
          setShouldHighlight(false);
          blockAutoFetchRef.current = false;
          setInMessageWindowView(false);
          return;
        }

        const paginatedMessageWindow = messageWindowResponse.data;
        if (!paginatedMessageWindow) {
          setTargetMessageId(null);
          setShouldHighlight(false);
          blockAutoFetchRef.current = false;
          setInMessageWindowView(false);
          return;
        }

        const isAtLatest = paginatedMessageWindow.hasMoreAfter === false;

        const newInfiniteQueryCache: InfiniteData<CursorPaginatedResponse<IMessage>> = {
          pages: [paginatedMessageWindow],
          pageParams: [null],
        };

        queryClient.setQueryData<InfiniteData<CursorPaginatedResponse<IMessage>>>(
          queryKey,
          newInfiniteQueryCache
        );

        setTargetMessageId(targetMessageIdParam);
        setShouldHighlight(highlight);

        if (isAtLatest) {
          setInMessageWindowView(false);
        }

        setTimeout(() => {
          blockAutoFetchRef.current = false;
        }, 1000);
      } catch (error) {
        logError("jumpToMessage: Failed to load target message window", error);
        setInMessageWindowView(false);
        setTargetMessageId(null);
        setShouldHighlight(false);
        blockAutoFetchRef.current = false;
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
            hasMoreAfter: false,
          };
          return { ...oldData, pages: [updatedFirstPage, ...oldData.pages.slice(1)] };
        }
      );
    },
    [queryClient, queryKey]
  );

  const updateConversationsListCache = useCallback(
    (newMessage: IMessage) => {
      let found = false;
      const listQueryKey = ["conversations", userId];

      queryClient.setQueriesData<InfiniteData<OffsetPaginatedResponse<IConversation>>>(
        { queryKey: listQueryKey },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            pages: oldData?.pages?.map((page) => {
              const conversationIndex = page.content.findIndex((c) => c.id === conversationId);

              if (conversationIndex === -1) return page;

              found = true;

              const existingConversation = page.content[conversationIndex];
              const existingLastMessage = existingConversation.messages?.[0];

              const shouldUpdateMessage =
                !existingLastMessage ||
                new Date(newMessage.createdAt) >= new Date(existingLastMessage.createdAt) ||
                newMessage.id === existingLastMessage.id;

              if (!shouldUpdateMessage) {
                return page;
              }

              const updatedConversation: IConversation = {
                ...existingConversation,
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

      if (!found) {
        queryClient.invalidateQueries({ queryKey: listQueryKey });
      }
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

  useEffect(() => {
    const handleNewMessage = ({
      conversationId: msgConversationId,
      messageWithConversation,
    }: {
      conversationId: number;
      messageWithConversation: IConversation;
    }) => {
      if (msgConversationId === conversationId) {
        const messages = messageWithConversation.messages || [];
        messages.forEach((msg) => {
          updateConversationMessagesCache(msg);
          updateConversationsListCache(msg);
        });
      }
    };

    eventBus.on(CONVERSATION_EVENTS.NEW_MESSAGE, handleNewMessage);

    return () => {
      eventBus.off(CONVERSATION_EVENTS.NEW_MESSAGE, handleNewMessage);
    };
  }, [conversationId, updateConversationMessagesCache, updateConversationsListCache]);

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
    shouldHighlight,
    clearTargetMessage,
  } as const;
}
