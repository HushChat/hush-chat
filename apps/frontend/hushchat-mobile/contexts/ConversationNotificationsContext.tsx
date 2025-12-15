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
  const queryClient = useQueryClient();
  const criteria = useMemo(() => getCriteria(selectedConversationType), [selectedConversationType]);
  const {
    user: { id: loggedInUserId },
  } = useUserStore();

  const conversationsQueryKey = conversationQueryKeys.allConversations(
    Number(loggedInUserId),
    criteria
  );

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
  }, [notificationConversation, queryClient, loggedInUserId, criteria]);

  const updateConversation = (conversationId: string | number, updates: Partial<IConversation>) => {
    updatePaginatedItemInCache<IConversation>(
      queryClient,
      conversationsQueryKey,
      conversationId,
      updates,
      getPaginationConfig<IConversation>()
    );
  };

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

    eventBus.on("websocket:message", handleIncomingWebSocketConversation);

    return () => {
      eventBus.off("websocket:message", handleIncomingWebSocketConversation);
    };
  }, []);

  const clearNotificationConversation = useCallback(() => {
    setNotificationConversation(null);
  }, []);

  useEffect(() => {
    const handleIncomingUserStatusUpdates = (userStatus: IUserStatus) => {
      if (userStatus) {
        setUserStatus(userStatus);
      }
    };

    eventBus.on("user:presence", handleIncomingUserStatusUpdates);

    return () => {
      eventBus.off("user:presence", handleIncomingUserStatusUpdates);
    };
  }, []);

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

    if (conversation == null) {
      return;
    }

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
  }, [userStatus, queryClient, loggedInUserId, criteria]);

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
