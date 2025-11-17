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
import { useQueryClient } from "@tanstack/react-query";
import { updatePaginatedItemInCache } from "@/query/config/updatePaginatedItemInCache";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { getPaginationConfig } from "@/utils/commonUtils";
import { getLastSeenMessageByConversationId } from "@/apis/conversation";
import { getCriteria } from "@/utils/conversationUtils";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useUserStore } from "@/store/user/useUserStore";
import { appendToOffsetPaginatedCache } from "@/query/config/appendToOffsetPaginatedCache";

const PAGE_SIZE = 20;

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
  const { selectedConversationType } = useConversationStore();
  const queryClient = useQueryClient();
  const criteria = useMemo(() => getCriteria(selectedConversationType), [selectedConversationType]);
  const {
    user: { id: userId },
  } = useUserStore();

  useEffect(() => {
    if (notificationReceivedConversation) {
      appendToOffsetPaginatedCache<IConversation>(
        queryClient,
        conversationQueryKeys.allConversations(Number(userId), criteria),
        notificationReceivedConversation,
        {
          getId: (m) => m?.id,
          pageSize: PAGE_SIZE,
          getPageItems: (p) => p?.content,
          setPageItems: (p, items) => ({ ...p, content: items }),
          dedupeAcrossPages: true,
        }
      );
    }
  }, [notificationReceivedConversation, queryClient, userId]);

  const updateConversation = (conversationId: string | number, updates: Partial<IConversation>) => {
    updatePaginatedItemInCache<IConversation>(
      queryClient,
      conversationQueryKeys.allConversations(Number(userId), criteria),
      conversationId,
      updates,
      getPaginationConfig<IConversation>()
    );
  };

  // Handle conversation update notifications
  useEffect(() => {
    const getConversationUpdateViaWS = async (conversationId: number) => {
      const response = await getLastSeenMessageByConversationId(conversationId);

      if (response) {
        updateConversation(conversationId, {
          unreadCount: response.unreadCount,
        });
      }
    };

    if (notificationReceivedConversation && notificationReceivedConversation.id) {
      getConversationUpdateViaWS(notificationReceivedConversation.id);
    }
  }, [notificationReceivedConversation]);

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
