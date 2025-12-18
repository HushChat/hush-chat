import { useUserStore } from "@/store/user/useUserStore";
import { ConversationType } from "@/types/chat/types";

export const useConversationHeaderTitle = (
  selectedConversationType: ConversationType,
  fallbackTitle: string = "Workspace"
) => {
  const user = useUserStore((state) => state.user);

  if (selectedConversationType === ConversationType.ARCHIVED) {
    return "Archived";
  }

  return user?.workspaceName || fallbackTitle;
};
