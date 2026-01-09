import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { eventBus } from "@/services/eventBus";
import { CONVERSATION_EVENTS } from "@/constants/ws/webSocketEventKeys";
import { conversationMessageQueryKeys } from "@/constants/queryKeys";
import { IMessage } from "@/types/chat/types";
import { MessageReadPayload } from "@/types/ws/types";
import { PaginatedResult } from "@/contexts/ConversationNotificationsContext";

interface UseMessageReadListenerProps {
  loggedInUserId: number;
}

/**
 * Handle message read status updates via WebSocket events.
 * Updates all messages with id <= lastSeenMessageId to have isReadByEveryone = true
 */
export const useMessageReadListener = ({ loggedInUserId }: UseMessageReadListenerProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMessageRead = (payload: MessageReadPayload) => {
      const { conversationId, lastSeenMessageId } = payload;

      const applyReadStatus = (msg: IMessage): IMessage => {
        // Mark as read if message ID is less than or equal to lastSeenMessageId
        if (Number(msg.id) <= Number(lastSeenMessageId)) {
          return {
            ...msg,
            isReadByEveryone: true,
          };
        }
        return msg;
      };

      // Update thread message caches for this conversation
      const threadKey = conversationMessageQueryKeys.messages(
        Number(loggedInUserId),
        conversationId
      );
      const root = Array.isArray(threadKey) ? threadKey[0] : threadKey;

      queryClient.setQueriesData(
        {
          predicate: (q) => {
            const key = q.queryKey as any[];
            if (!Array.isArray(key)) return false;
            if (key[0] !== root) return false;

            // Match this conversations thread query
            return key.some((k) => Number(k) === Number(conversationId));
          },
        },
        (old: any) => {
          if (!old?.pages) return old;

          return {
            ...old,
            pages: old.pages.map((page: PaginatedResult<IMessage>) => ({
              ...page,
              content: (page?.content ?? []).map(applyReadStatus),
            })),
          };
        }
      );
    };

    eventBus.on(CONVERSATION_EVENTS.MESSAGE_READ, handleMessageRead);

    return () => {
      eventBus.off(CONVERSATION_EVENTS.MESSAGE_READ, handleMessageRead);
    };
  }, [queryClient, loggedInUserId]);
};
