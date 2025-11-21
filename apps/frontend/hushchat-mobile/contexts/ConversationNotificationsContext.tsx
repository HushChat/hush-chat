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
import { IConversation } from "@/types/chat/types";
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

// Define the shape of your paginated response to safely access 'content'
interface PaginatedResponse<T> {
  content: T[];
  last?: boolean;
  totalElements?: number;
  totalPages?: number;
  number?: number;
  size?: number;
}

interface ConversationNotificationsContextType {
  notificationReceivedConversation: IConversation | null;
  clearConversation: () => void;
  updateConversation: (conversationId: string | number, updates: Partial<IConversation>) => void;
}

const ConversationNotificationsContext = createContext<
  ConversationNotificationsContextType | undefined
>(undefined);

export const ConversationNotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notificationReceivedConversation, setNotificationReceivedConversation] =
    useState<IConversation | null>(null);

  const { selectedConversationType, selectedConversationId } = useConversationStore();
  const queryClient = useQueryClient();
  const criteria = useMemo(() => getCriteria(selectedConversationType), [selectedConversationType]);
  const {
    user: { id: userId },
  } = useUserStore();

  // 1. Handle Incoming Message Notification & Update Cache Atomically
  useEffect(() => {
    if (!notificationReceivedConversation) return;

    const targetId = notificationReceivedConversation.id;
    const queryKey = conversationQueryKeys.allConversations(Number(userId), criteria);

    // --- STEP A: Determine the correct Unread Count ---
    let nextUnreadCount = 0;

    // We only calculate unread count if the user is NOT currently viewing this conversation.
    // If they ARE viewing it, the count stays 0 (read).
    if (targetId !== selectedConversationId) {
      // 1. Get the current state of the cache
      const currentCache =
        queryClient.getQueryData<InfiniteData<PaginatedResponse<IConversation>>>(queryKey);

      let existingCount = 0;

      // 2. Find the existing conversation in the cache to get its CURRENT unread count
      if (currentCache?.pages) {
        for (const page of currentCache.pages) {
          const foundConversation = page.content.find((c) => c.id === targetId);
          if (foundConversation) {
            // Default to 0 if undefined
            existingCount = foundConversation.unreadCount || 0;
            break; // Found it, stop looping
          }
        }
      }

      // 3. Calculate new count: Existing + 1 (for the new message)
      nextUnreadCount = existingCount + 1;
    }

    // --- STEP B: Create the Updated Conversation Object ---
    // We merge the new message data from WebSocket with our calculated count
    const updatedConversationObject = {
      ...notificationReceivedConversation,
      unreadCount: nextUnreadCount,
    };

    // --- STEP C: Update Cache (Move to Top + Set Count) ---
    appendToOffsetPaginatedCache<IConversation>(queryClient, queryKey, updatedConversationObject, {
      getId: (m) => m?.id,
      pageSize: PAGE_SIZE,
      getPageItems: (p) => p?.content,
      setPageItems: (p, items) => ({ ...p, content: items }),
      dedupeAcrossPages: true,
    });
  }, [notificationReceivedConversation, queryClient, userId, criteria, selectedConversationId]);

  const updateConversation = (conversationId: string | number, updates: Partial<IConversation>) => {
    updatePaginatedItemInCache<IConversation>(
      queryClient,
      conversationQueryKeys.allConversations(Number(userId), criteria),
      conversationId,
      updates,
      getPaginationConfig<IConversation>()
    );
  };

  // 2. WebSocket Listener
  useEffect(() => {
    const handleWebSocketMessage = (messageWithConversation: IConversation) => {
      const doesConversationListShouldBeUpdated =
        messageWithConversation?.id && !messageWithConversation.archivedByLoggedInUser;

      if (doesConversationListShouldBeUpdated) {
        setNotificationReceivedConversation(messageWithConversation);

        if (!messageWithConversation.mutedByLoggedInUser) {
          playMessageSound();
        }
      }
    };

    eventBus.on("websocket:message", handleWebSocketMessage);

    return () => {
      eventBus.off("websocket:message", handleWebSocketMessage);
    };
  }, []);

  const clearConversation = useCallback(() => {
    setNotificationReceivedConversation(null);
  }, []);

  return (
    <ConversationNotificationsContext.Provider
      value={{ notificationReceivedConversation, clearConversation, updateConversation }}
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
