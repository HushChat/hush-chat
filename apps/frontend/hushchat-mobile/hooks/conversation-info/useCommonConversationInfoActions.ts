import { useState, useEffect, useCallback } from "react";
import { useUserStore } from "@/store/user/useUserStore";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useConversationFavorites } from "@/hooks/useConversationFavorites";
import { useTogglePinConversationMutation } from "@/query/post/queries";
import { useDeleteConversationByIdMutation } from "@/query/delete/queries";
import { getCriteria } from "@/utils/conversationUtils";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { ToastUtils } from "@/utils/toastUtils";

interface UseConversationActionsProps {
  conversationId: number;
  initialPinned?: boolean;
  initialFavorite?: boolean;
  onDeleteSuccess?: () => void;
}

export const useCommonConversationInfoActions = ({
  conversationId,
  initialPinned = false,
  initialFavorite = false,
  onDeleteSuccess,
}: UseConversationActionsProps) => {
  const {
    user: { id: userId },
  } = useUserStore();
  const { selectedConversationType } = useConversationStore();

  const criteria = getCriteria(selectedConversationType);
  const [isPinned, setIsPinned] = useState(initialPinned);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);

  useEffect(() => {
    setIsPinned(initialPinned);
    setIsFavorite(initialFavorite);
  }, [initialPinned, initialFavorite]);

  const { handleToggleFavorites } = useConversationFavorites(conversationId, criteria);

  const toggleFavorite = useCallback(async () => {
    await handleToggleFavorites(conversationId);
    setIsFavorite((prev) => !prev);
  }, [conversationId, handleToggleFavorites]);

  const togglePinMutation = useTogglePinConversationMutation(
    {
      userId: Number(userId),
      conversationId,
      criteria,
    },
    () => setIsPinned((prev) => !prev),
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const togglePin = useCallback(() => {
    togglePinMutation.mutate(conversationId);
  }, [conversationId, togglePinMutation]);

  const deleteConversationMutation = useDeleteConversationByIdMutation(
    { userId: Number(userId), criteria },
    () => {
      ToastUtils.success("Conversation deleted successfully!");
      onDeleteSuccess?.();
    },
    (error) => ToastUtils.error(error as string)
  );

  const deleteConversation = useCallback(() => {
    deleteConversationMutation.mutate(conversationId);
  }, [conversationId, deleteConversationMutation]);

  return {
    isPinned,
    isFavorite,
    togglePin,
    toggleFavorite,
    deleteConversation,
    selectedConversationType,
  };
};
