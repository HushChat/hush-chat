import { getConversationById } from "@/apis/conversation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { isAccessDeniedError, skipRetryOnAccessDenied } from "@/utils/apiErrorUtils";
import { useEffect } from "react";

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
    queryKey: conversationQueryKeys.metaDataById(Number(userId), conversationId),
    queryFn: () => getConversationById(conversationId),
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
    retry: skipRetryOnAccessDenied,
    enabled: !!conversationId && conversationId > 0,
  });

  useEffect(() => {
    const participants = conversationAPIResponse?.participants;
    if (!participants?.length) return;

    const participantsKey = conversationQueryKeys.ConversationParticipants(conversationId, "");
    const existingData = queryClient.getQueryData(participantsKey);
    if (existingData) return;

    queryClient.setQueryData(participantsKey, {
      pages: [
        {
          content: participants,
          last: true,
          total: participants.length,
          pageable: { pageNumber: 0 },
        },
      ],
      pageParams: [0],
    });
  }, [conversationAPIResponse?.participants, conversationId, queryClient]);

  const refetchConversation = () => {
    queryClient.invalidateQueries({
      queryKey: conversationQueryKeys.metaDataById(Number(userId), conversationId),
    });
  };

  const isConversationNotFound = conversationAPIError && isAccessDeniedError(conversationAPIError);

  return {
    conversationAPIResponse,
    conversationAPILoading,
    conversationAPIError,
    isConversationNotFound,
    refetchConversation,
  };
};
