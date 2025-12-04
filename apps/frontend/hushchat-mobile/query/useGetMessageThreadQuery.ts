import { getMessageThread } from "@/apis/message";
import { conversationMessageQueryKeys } from "@/constants/queryKeys";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useGetMessageThreadQuery = (messageId: number) => {
  const queryClient = useQueryClient();

  const {
    data: messageThreadAPIResponse,
    isLoading: messageThreadAPILoading,
    error: messageThreadAPIError,
  } = useQuery({
    queryKey: conversationMessageQueryKeys.messageThread(messageId),
    queryFn: () => getMessageThread(messageId),
    staleTime: 2 * 60 * 1000,
  });

  const refetchMessageThread = () => {
    queryClient.invalidateQueries({
      queryKey: conversationMessageQueryKeys.messageThread(messageId),
    });
  };

  return {
    messageThreadAPIResponse,
    messageThreadAPILoading,
    messageThreadAPIError,
    refetchMessageThread,
  };
};
