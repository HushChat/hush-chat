import { useCallback } from "react";
import { ConversationFilterCriteria } from "@/apis/conversation";
import { ToastUtils } from "@/utils/toastUtils";
import { useToggleConversationFavoriteMutation } from "@/query/patch/queries";
import { useUserStore } from "@/store/user/useUserStore";

export function useConversationFavorites(
  conversationId: number,
  criteria: ConversationFilterCriteria,
) {
  const {
    user: { id: userId },
  } = useUserStore();
  const toggleFavorite = useToggleConversationFavoriteMutation({
    userId: Number(userId),
    conversationId,
    criteria,
  });

  const handleToggleFavorites = useCallback(
    async (conversationId: number) => {
      try {
        toggleFavorite.mutate(conversationId);
      } catch {
        ToastUtils.error("Failed to update favorites!");
      }
    },
    [toggleFavorite],
  );

  return { handleToggleFavorites };
}
