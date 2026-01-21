import { useMemo, useState } from "react";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useForwardMessageMutation } from "@/query/patch/queries";
import { ToastUtils } from "@/utils/toastUtils";
import { TConversation } from "@/components/ConversationsMultiSelect";
import { EMPTY_SET } from "@/constants/constants";
import { useUserStore } from "@/store/user/useUserStore";
import { getCriteria } from "@/utils/conversationUtils";
import { router } from "expo-router";
import { CONVERSATION } from "@/constants/routes";
import { TMessageForwardResponse } from "@/types/chat/types";

export const useForwardMessageHandler = (onSuccess?: () => void) => {
  const { selectedMessageIds, setSelectionMode, setSelectedMessageIds, selectedConversationType } =
    useConversationStore();
  const [selectedConversations, setSelectedConversations] = useState<TConversation[]>([]);
  const [customText, setCustomText] = useState<string>("");
  const {
    user: { id: userId },
  } = useUserStore();
  const criteria = getCriteria(selectedConversationType);

  const selectedCount = selectedMessageIds.size;

  const resetSelection = () => {
    setSelectionMode(false);
    setSelectedMessageIds(EMPTY_SET);
  };

  const { mutate: forwardMessage, isPending } = useForwardMessageMutation(
    {
      userId: userId,
      criteria: criteria,
    },
    (data: TMessageForwardResponse) => {
      resetSelection();
      onSuccess?.();
      if (data.forwardedTo.length > 0) {
        const lastConversationId = data.forwardedTo[data.forwardedTo.length - 1];
        router.replace(CONVERSATION(lastConversationId));
      }
    },
    () => {
      ToastUtils.error(`Failed to forward message${selectedCount > 1 ? "s" : ""}`);
    }
  );

  const handleSend = () => {
    const conversationIds: number[] = [];
    const userIds: number[] = [];

    selectedConversations.forEach((item) => {
      if ("username" in item) {
        userIds.push(Number(item.id));
      } else {
        conversationIds.push(Number(item.id));
      }
    });
    forwardMessage({
      forwardedMessageIds: Array.from(selectedMessageIds),
      conversationIds: conversationIds.length > 0 ? conversationIds : undefined,
      userIds: userIds.length > 0 ? userIds : undefined,
      customText: customText,
      isMarkdownEnabled: false,
    });
  };

  const canSend = useMemo(
    () => selectedCount > 0 && selectedConversations.length > 0 && !isPending,
    [selectedCount, selectedConversations.length, isPending]
  );

  return {
    selectedConversations,
    setSelectedConversations,
    customText,
    setCustomText,
    selectedCount,
    isPending,
    canSend,
    resetSelection,
    handleSend,
  };
};
