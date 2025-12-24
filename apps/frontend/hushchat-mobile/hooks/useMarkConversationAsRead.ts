// @/hooks/useMarkConversationAsRead.ts
import { useQueryClient } from "@tanstack/react-query";
import { useConversationNotificationsContext } from "@/contexts/ConversationNotificationsContext";
import { ToastUtils } from "@/utils/toastUtils";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { useState } from "react";
import { markConversationMessagesAsRead } from "@/apis/message";

export const useMarkConversationAsRead = () => {
  const queryClient = useQueryClient();
  const { updateConversation } = useConversationNotificationsContext();
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false);

  const markConversationAsRead = async (conversationId: number) => {
    if (isMarkingAsRead) return;

    try {
      setIsMarkingAsRead(true);

      await markConversationMessagesAsRead(conversationId);

      updateConversation(conversationId, { unreadCount: 0 });

      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (error) {
      ToastUtils.error(getAPIErrorMsg(error));
    } finally {
      setIsMarkingAsRead(false);
    }
  };

  return {
    markConversationAsRead,
    isMarkingAsRead,
  };
};
