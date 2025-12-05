import { useEffect, useRef } from "react";
import { router } from "expo-router";
import { PLATFORM } from "@/constants/platformConstants";
import { CHAT_VIEW_PATH } from "@/constants/routes";
import { IConversation } from "@/types/chat/types";

interface ILinkConversationParams {
  initialConversationId?: number;
  conversations: IConversation[];
  onConversationFound: (conversation: IConversation) => void;
}

export function useLinkConversation({
  initialConversationId,
  conversations,
  onConversationFound,
}: ILinkConversationParams) {
  const hasInitialized = useRef(false);
  const previousConversationId = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (previousConversationId.current !== initialConversationId) {
      hasInitialized.current = false;
      previousConversationId.current = initialConversationId;
    }

    if (!initialConversationId || conversations.length === 0 || hasInitialized.current) {
      return;
    }

    const conversation = conversations.find(
      (conversation) => conversation.id === initialConversationId
    );
    if (!conversation) return;

    hasInitialized.current = true;

    if (PLATFORM.IS_WEB) {
      onConversationFound(conversation);
    } else {
      router.push({
        pathname: CHAT_VIEW_PATH,
        params: { conversationId: conversation.id },
      });
    }
  }, [initialConversationId, conversations, onConversationFound]);
}
