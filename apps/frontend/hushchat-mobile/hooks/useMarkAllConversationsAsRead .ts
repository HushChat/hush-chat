import { useQueryClient } from "@tanstack/react-query";
import { markAllMessagesInAllConversationsAsRead } from "@/apis/conversation";
import { useConversationNotificationsContext } from "@/contexts/ConversationNotificationsContext";
import { ToastUtils } from "@/utils/toastUtils";
import { getAPIErrorMsg } from "@/utils/commonUtils";

export const useMarkAllConversationsAsRead = () => {
  const queryClient = useQueryClient();
  const { resetAllUnreadCounts } = useConversationNotificationsContext();

  const markAllConversationsAsRead = async () => {
    try {
      await markAllMessagesInAllConversationsAsRead();
      resetAllUnreadCounts();
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (error) {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  };

  return {
    markAllConversationsAsRead,
  };
};
