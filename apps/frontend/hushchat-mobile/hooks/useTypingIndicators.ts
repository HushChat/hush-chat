import { useEffect, useState, useCallback } from "react";
import { eventBus } from "@/services/eventBus";
import { CONVERSATION_EVENTS } from "@/constants/ws/webSocketEventKeys";
import { TypingIndicator } from "@/types/ws/types";

const TYPING_TIMEOUT = 4500; // 4.5 seconds

export const useTypingIndicators = () => {
  const [typingUsers, setTypingUsers] = useState<Record<string, TypingIndicator>>({});

  useEffect(() => {
    const handleTypingIndicator = (typingIndicator: TypingIndicator) => {
      const { chatUserName, conversationId, typing } = typingIndicator;
      const key = `${conversationId}-${chatUserName}`;

      setTypingUsers((prev) => {
        if (typing) {
          return { ...prev, [key]: typingIndicator };
        }
        const updated = { ...prev };
        delete updated[key];
        return updated;
      });

      if (typing) {
        setTimeout(() => {
          setTypingUsers((prev) => {
            const rest = { ...prev };
            delete rest[key];
            return rest;
          });
        }, TYPING_TIMEOUT);
      }
    };

    eventBus.on(CONVERSATION_EVENTS.TYPING, handleTypingIndicator);
    return () => {
      eventBus.off(CONVERSATION_EVENTS.TYPING, handleTypingIndicator);
    };
  }, []);

  const getTypingUsersForConversation = useCallback(
    (conversationId: string | number) => {
      return Object.values(typingUsers).filter(
        (indicator) => Number(indicator.conversationId) === Number(conversationId)
      );
    },
    [typingUsers]
  );

  return { typingUsers, getTypingUsersForConversation };
};
