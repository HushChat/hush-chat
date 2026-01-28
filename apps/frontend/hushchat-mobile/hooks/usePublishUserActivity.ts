import { useEffect } from "react";
import { useUserStore } from "@/store/user/useUserStore";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { getAllTokens } from "@/utils/authUtils";
import { UserActivityWSSubscriptionData } from "@/types/ws/types";
import { IConversation } from "@/types/chat/types";

interface IUserActivityParams {
  conversations: IConversation[];
  selectedConversationId: number | null;
}

export const usePublishUserActivity = ({
  conversations,
  selectedConversationId,
}: IUserActivityParams) => {
  const {
    user: { email },
  } = useUserStore();
  const { publishActivity } = useWebSocket();

  useEffect(() => {
    const publishUserActivity = async () => {
      const { workspace } = await getAllTokens();
      const conversationIds = conversations.map((c) => c.id);

      await publishActivity({
        workspaceId: workspace as string,
        email,
        visibleConversations: conversationIds,
        openedConversation: selectedConversationId ?? undefined,
      } as UserActivityWSSubscriptionData);
    };

    if (conversations.length) {
      void publishUserActivity();
    }
  }, [conversations, selectedConversationId, email, publishActivity]);
};
