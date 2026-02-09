import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQueryClient, type InfiniteData } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { conversationMessageQueryKeys, conversationQueryKeys } from "@/constants/queryKeys";
import { usePaginatedQueryWithCursor } from "@/query/usePaginatedQueryWithCursor";
import { eventBus } from "@/services/eventBus";
import { CONVERSATION_EVENTS } from "@/constants/ws/webSocketEventKeys";
import {
  CursorPaginatedResponse,
  getConversationMessagesByCursor,
  getMessagesAroundMessageId,
  ConversationFilterCriteria,
} from "@/apis/conversation";
import { IMessage, IConversation, ConversationType } from "@/types/chat/types";
import { OffsetPaginatedResponse } from "@/query/usePaginatedQueryWithOffset";
import { ToastUtils } from "@/utils/toastUtils";
import { logError } from "@/utils/logger";
import { separatePinnedItems } from "@/query/config/appendToOffsetPaginatedCache";
import { skipRetryOnAccessDenied } from "@/utils/apiErrorUtils";

const PAGE_SIZE = 20;

const getCriteriaFromType = (type: ConversationType): ConversationFilterCriteria => {
  switch (type) {
    case ConversationType.ARCHIVED:
      return { isArchived: true };
    case ConversationType.FAVORITES:
      return { isFavorite: true, isArchived: false };
    case ConversationType.MUTED:
      return { isMuted: true, isArchived: false };
    case ConversationType.GROUPS:
      return { isGroup: true, isArchived: false } as any;
    case ConversationType.UNREAD:
      return { hasUnread: true, isArchived: false } as any;
    case ConversationType.ALL:
    default:
      return { isArchived: false };
  }
};

const isConversationCompliant = (
  conversation: IConversation,
  filterType: ConversationType,
  currentUserId: number
): boolean => {
  const isArchived = conversation.archivedByLoggedInUser;
  const isMuted = conversation.mutedByLoggedInUser;
  const isFavorite = conversation.favoriteByLoggedInUser;
  const isGroup = conversation.isGroup;

  switch (filterType) {
    case ConversationType.ALL:
      return !isArchived;

    case ConversationType.ARCHIVED:
      return isArchived;

    case ConversationType.FAVORITES:
      return isFavorite && !isArchived;

    case ConversationType.MUTED:
      return isMuted && !isArchived;

    case ConversationType.GROUPS:
      return isGroup && !isArchived;

    case ConversationType.UNREAD:
      return !isMuted && !isArchived;

    case ConversationType.MENTIONED: {
      const lastMessage = conversation.messages?.[0];
      const hasMention = lastMessage?.mentions?.some((u) => u.id === currentUserId) ?? false;
      return hasMention && !isArchived;
    }

    default:
      return !isArchived;
  }
};

export function useConversationMessagesQuery(
  conversationId: number,
  options?: { enabled?: boolean }
) {
  const {
    user: { id: userId },
  } = useUserStore();

  const { selectedConversationType } = useConversationStore();

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
      previousConversationId.current = conversationId;
      setInMessageWindowView(false);
      setTargetMessageId(null);
    }
  }, [conversationId]);

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
    enabled: !!conversationId && options?.enabled,
    allowForwardPagination: inMessageWindowView,
    retry: skipRetryOnAccessDenied,
    refetchOnMount: true,
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
      const activeCriteria = getCriteriaFromType(selectedConversationType);

      const queryKeysMap = {
        selectedConversation: conversationQueryKeys.allConversations(
          Number(userId),
          activeCriteria
        ),
        allConversation: conversationQueryKeys.allConversations(Number(userId), {}),
      };

      Object.entries(queryKeysMap).forEach(([keyName, listQueryKey]) => {
        let foundInThisList = false;

        queryClient.setQueriesData<InfiniteData<OffsetPaginatedResponse<IConversation>>>(
          { queryKey: listQueryKey },
          (oldData) => {
            if (!oldData) return oldData;

            return {
              ...oldData,
              pages: oldData?.pages?.map((page) => {
                const conversationIndex = page.content.findIndex((c) => c.id === conversationId);

                if (conversationIndex === -1) return page;

                foundInThisList = true;

                const existingConversation = page.content[conversationIndex];

                if (keyName === "allConversation" && existingConversation.archivedByLoggedInUser) {
                  return page;
                }

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

        if (!foundInThisList) {
          queryClient.invalidateQueries({ queryKey: listQueryKey });
        }
      });
    },
    [queryClient, conversationId, userId, selectedConversationType]
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
      const messages = messageWithConversation.messages || [];

      if (msgConversationId === conversationId) {
        messages.forEach((msg) => {
          updateConversationMessagesCache(msg);
        });
      }

      const shouldUpdateList = isConversationCompliant(
        messageWithConversation,
        selectedConversationType,
        Number(userId)
      );

      if (shouldUpdateList) {
        messages.forEach((msg) => {
          updateConversationsListCache(msg);
        });
      }
    };

    eventBus.on(CONVERSATION_EVENTS.NEW_MESSAGE, handleNewMessage);

    return () => {
      eventBus.off(CONVERSATION_EVENTS.NEW_MESSAGE, handleNewMessage);
    };
  }, [
    conversationId,
    userId,
    selectedConversationType,
    updateConversationMessagesCache,
    updateConversationsListCache,
  ]);

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
