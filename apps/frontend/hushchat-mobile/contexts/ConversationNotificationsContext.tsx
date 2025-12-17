import {
  createContext,
  useContext,
  ReactNode,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { eventBus } from "@/services/eventBus";
import { IConversation, IUserStatus } from "@/types/chat/types";
import { playMessageSound } from "@/utils/playSound";
import { useQueryClient, InfiniteData } from "@tanstack/react-query";
import { updatePaginatedItemInCache } from "@/query/config/updatePaginatedItemInCache";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { getPaginationConfig } from "@/utils/commonUtils";
import { getCriteria } from "@/utils/conversationUtils";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useUserStore } from "@/store/user/useUserStore";
import { appendToOffsetPaginatedCache } from "@/query/config/appendToOffsetPaginatedCache";
import {
  CONVERSATION_EVENTS,
  USER_EVENTS,
  WEBSOCKET_EVENTS,
} from "@/constants/ws/webSocketEventKeys";

const PAGE_SIZE = 20;

interface PaginatedResult<T> {
  content: T[];
  last?: boolean;
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

interface ConversationNotificationsContextValue {
  notificationConversation: IConversation | null;
  clearNotificationConversation: () => void;
  updateConversation: (conversationId: string | number, updates: Partial<IConversation>) => void;
}

const ConversationNotificationsContext = createContext<
  ConversationNotificationsContextValue | undefined
>(undefined);

export const ConversationNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notificationConversation, setNotificationConversation] = useState<IConversation | null>(
    null
  );
  const { selectedConversationType } = useConversationStore();
  const [userStatus, setUserStatus] = useState<IUserStatus | null>(null);

  // separate state for new conversation events (prevents unread logic running)
  const [createdConversation, setCreatedConversation] = useState<IConversation | null>(null);

  const queryClient = useQueryClient();
  const criteria = useMemo(() => getCriteria(selectedConversationType), [selectedConversationType]);
  const {
    user: { id: loggedInUserId },
  } = useUserStore();

  const conversationsQueryKey = conversationQueryKeys.allConversations(
    Number(loggedInUserId),
    criteria
  );

  /**
   * Message-received -> update unread and move to top
   */
  useEffect(() => {
    if (!notificationConversation) return;

    const conversationId = notificationConversation.id;

    const existingCache =
      queryClient.getQueryData<InfiniteData<PaginatedResult<IConversation>>>(conversationsQueryKey);

    let existingUnreadCount = 0;
    let matchedNotification = notificationConversation;

    if (existingCache?.pages) {
      for (const page of existingCache.pages) {
        const match = page.content.find((conversation) => conversation.id === conversationId);
        if (match) {
          existingUnreadCount = match.unreadCount || 0;
          matchedNotification = match;
          break;
        }
      }
    }

    const updatedUnreadCount = existingUnreadCount + 1;

    const mergedConversation = {
      ...notificationConversation,
      chatUserStatus: matchedNotification?.chatUserStatus,
      unreadCount: updatedUnreadCount,
      deviceType: matchedNotification?.deviceType,
    };

    appendToOffsetPaginatedCache<IConversation>(
      queryClient,
      conversationsQueryKey,
      mergedConversation,
      {
        getId: (item) => item?.id,
        pageSize: PAGE_SIZE,
        getPageItems: (page) => page?.content,
        setPageItems: (page, items) => ({ ...page, content: items }),
        moveUpdatedToTop: true,
        isPinned: (conversation) => conversation.pinnedByLoggedInUser,
      }
    );
  }, [notificationConversation, queryClient, conversationsQueryKey]);

  const updateConversation = (conversationId: string | number, updates: Partial<IConversation>) => {
    updatePaginatedItemInCache<IConversation>(
      queryClient,
      conversationsQueryKey,
      conversationId,
      updates,
      getPaginationConfig<IConversation>()
    );
  };

  /**
   * WS message event listener
   */
  useEffect(() => {
    const handleIncomingWebSocketConversation = (conversation: IConversation) => {
      const shouldUpdate = conversation?.id && !conversation.archivedByLoggedInUser;

      if (shouldUpdate) {
        setNotificationConversation(conversation);

        if (!conversation.mutedByLoggedInUser) {
          void playMessageSound();
        }
      }
    };

    eventBus.on(WEBSOCKET_EVENTS.MESSAGE, handleIncomingWebSocketConversation);

    return () => {
      eventBus.off(WEBSOCKET_EVENTS.MESSAGE, handleIncomingWebSocketConversation);
    };
  }, []);

  /**
   * Conversation created listener (group added / new group)
   */
  useEffect(() => {
    const handleConversationCreated = (conversation: IConversation) => {
      if (!conversation?.id) return;

      // If backend sends archived=true per-participant, skip it (same rule as messages)
      if (conversation.archivedByLoggedInUser) return;

      setCreatedConversation(conversation);
    };

    eventBus.on(CONVERSATION_EVENTS.CREATED, handleConversationCreated);

    return () => {
      eventBus.off(CONVERSATION_EVENTS.CREATED, handleConversationCreated);
    };
  }, []);

  /**
   *  Apply conversation-created into cache (append + move to top)
   */
  useEffect(() => {
    if (!createdConversation) return;

    const existingCache =
      queryClient.getQueryData<InfiniteData<PaginatedResult<IConversation>>>(conversationsQueryKey);

    const existsAlready =
      existingCache?.pages?.some((p) => p.content?.some((c) => c.id === createdConversation.id)) ??
      false;

    if (!existsAlready) {
      appendToOffsetPaginatedCache<IConversation>(
        queryClient,
        conversationsQueryKey,
        {
          ...createdConversation,
          unreadCount: createdConversation.unreadCount ?? 0,
        },
        {
          getId: (item) => item?.id,
          pageSize: PAGE_SIZE,
          getPageItems: (page) => page?.content,
          setPageItems: (page, items) => ({ ...page, content: items }),
          moveUpdatedToTop: true,
          isPinned: (conversation) => conversation.pinnedByLoggedInUser,
        }
      );
    } else {
      // If it already exists, still update it + move to top (optional but nice UX)
      appendToOffsetPaginatedCache<IConversation>(
        queryClient,
        conversationsQueryKey,
        createdConversation,
        {
          getId: (item) => item?.id,
          pageSize: PAGE_SIZE,
          getPageItems: (page) => page?.content,
          setPageItems: (page, items) => ({ ...page, content: items }),
          moveUpdatedToTop: true,
          isPinned: (conversation) => conversation.pinnedByLoggedInUser,
        }
      );
    }

    setCreatedConversation(null);
  }, [createdConversation, queryClient, conversationsQueryKey]);

  const clearNotificationConversation = useCallback(() => {
    setNotificationConversation(null);
  }, []);

  /**
   * Presence listener
   */
  useEffect(() => {
    const handleIncomingUserStatusUpdates = (userStatus: IUserStatus) => {
      if (userStatus) {
        setUserStatus(userStatus);
      }
    };

    eventBus.on(USER_EVENTS.PRESENCE, handleIncomingUserStatusUpdates);

    return () => {
      eventBus.off(USER_EVENTS.PRESENCE, handleIncomingUserStatusUpdates);
    };
  }, []);

  /**
   * Apply presence changes into cache
   */
  useEffect(() => {
    if (!userStatus) return;

    const conversationId = userStatus.conversationId;

    const existingCache =
      queryClient.getQueryData<InfiniteData<PaginatedResult<IConversation>>>(conversationsQueryKey);

    let conversation: IConversation | null = null;

    if (existingCache?.pages) {
      for (const page of existingCache.pages) {
        const match = page.content.find((conversation) => conversation.id === conversationId);
        if (match) {
          conversation = match;
          break;
        }
      }
    }

    if (conversation == null) return;

    const mergedConversation = {
      ...conversation,
      chatUserStatus: userStatus.status,
      deviceType: userStatus.deviceType,
    };

    appendToOffsetPaginatedCache<IConversation>(
      queryClient,
      conversationsQueryKey,
      mergedConversation,
      {
        getId: (item) => item?.id,
        pageSize: PAGE_SIZE,
        getPageItems: (page) => page?.content,
        setPageItems: (page, items) => ({ ...page, content: items }),
      }
    );
  }, [userStatus, queryClient, conversationsQueryKey]);

  return (
    <ConversationNotificationsContext.Provider
      value={{
        notificationConversation,
        clearNotificationConversation,
        updateConversation,
      }}
    >
      {children}
    </ConversationNotificationsContext.Provider>
  );
};

export const useConversationNotificationsContext = () => {
  const context = useContext(ConversationNotificationsContext);
  if (!context) {
    throw new Error(
      "useConversationNotificationsContext must be used within ConversationNotificationsProvider"
    );
  }
  return context;
};
