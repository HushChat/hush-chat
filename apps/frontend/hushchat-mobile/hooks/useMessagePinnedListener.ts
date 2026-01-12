import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { eventBus } from "@/services/eventBus";
import { CONVERSATION_EVENTS } from "@/constants/ws/webSocketEventKeys";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { MessagePinnedPayload } from "@/types/ws/types";
import { ConversationAPIResponse } from "@/types/chat/types";

interface UseMessagePinnedListenerProps {
  loggedInUserId: number;
}

/**
 * Handle pinned message updates via WebSocket events.
 * Updates conversation metadata with pinned/unpinned message
 */
export const useMessagePinnedListener = ({ loggedInUserId }: UseMessagePinnedListenerProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleMessagePinned = (payload: MessagePinnedPayload) => {
      const { conversationId, pinnedMessage } = payload;

      // Get the metadata query key for this conversation
      const metadataKey = conversationQueryKeys.metaDataById(loggedInUserId, conversationId);

      queryClient.setQueryData(metadataKey, (old: ConversationAPIResponse) => {
        if (!old) return old;

        return {
          ...old,
          pinnedMessage: pinnedMessage ?? null,
        };
      });
    };

    eventBus.on(CONVERSATION_EVENTS.MESSAGE_PINNED, handleMessagePinned);

    return () => {
      eventBus.off(CONVERSATION_EVENTS.MESSAGE_PINNED, handleMessagePinned);
    };
  }, [queryClient, loggedInUserId]);
};
