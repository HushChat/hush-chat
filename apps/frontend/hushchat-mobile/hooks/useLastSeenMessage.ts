import { useRef, useCallback, useEffect } from "react";
import { useSetLastSeenMessageMutation } from "@/query/patch/queries";
import { useFetchLastSeenMessageStatusForConversation } from "@/query/useFetchLastSeenMessageStatusForConversation";
import { ConversationReadInfo } from "@/types/chat/types";

export const useLastSeenMessage = (currentUserId: number, conversationId?: number) => {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const pendingUpdateRef = useRef<{ conversationId: number; messageId: number } | null>(null);

  // Helper to update cache (using dummy ID 0 to get the function)
  // !!0 will make false in query enabled
  const { updateLastSeenMessageStatusForConversationCache } =
    useFetchLastSeenMessageStatusForConversation(0);

  const { mutate: setLastSeenMessage } = useSetLastSeenMessageMutation(
    { conversationId: conversationId, currentUserId },
    (data: ConversationReadInfo) => {
      updateLastSeenMessageStatusForConversationCache(conversationId ?? 0, data);
    }
  );

  const queueLastSeenUpdate = useCallback(
    (newConversationId: number, newMessageId: number) => {
      const pending = pendingUpdateRef.current;

      if (pending && pending.conversationId !== newConversationId) {
        if (timerRef.current) clearTimeout(timerRef.current);
        setLastSeenMessage(pending);
      }

      if (timerRef.current) clearTimeout(timerRef.current);

      pendingUpdateRef.current = { conversationId: newConversationId, messageId: newMessageId };

      timerRef.current = setTimeout(() => {
        setLastSeenMessage({ conversationId: newConversationId, messageId: newMessageId });
        pendingUpdateRef.current = null;
      }, 3000); // 3 second debounce
    },
    [setLastSeenMessage]
  );

  useEffect(() => {
    return () => {
      if (timerRef.current && pendingUpdateRef.current) {
        clearTimeout(timerRef.current);
        setLastSeenMessage(pendingUpdateRef.current);
      }
    };
  }, []);

  return { queueLastSeenUpdate };
};
