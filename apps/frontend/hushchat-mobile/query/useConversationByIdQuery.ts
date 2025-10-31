import { getConversationById } from "@/apis/conversation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { conversationQueryKeys } from "@/constants/queryKeys";

export const useConversationByIdQuery = (conversationId: number) => {
  const {
    user: { id: userId },
  } = useUserStore();
  const queryClient = useQueryClient();

  const {
    data: conversationAPIResponse,
    isLoading: conversationAPILoading,
    error: conversationAPIError,
  } = useQuery({
    queryKey: conversationQueryKeys.metaDataById(
      Number(userId),
      conversationId,
    ),
    queryFn: () => getConversationById(conversationId),
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  const refetchConversation = () => {
    queryClient.invalidateQueries({
      queryKey: conversationQueryKeys.metaDataById(
        Number(userId),
        conversationId,
      ),
    });
  };

  return {
    conversationAPIResponse,
    conversationAPILoading,
    conversationAPIError,
    refetchConversation,
  };
};
