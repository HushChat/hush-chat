import { usePaginatedQuery } from "@/query/usePaginatedQuery";
import { getConversationParticipants } from "@/apis/conversation";
import { conversationQueryKeys } from "@/constants/queryKeys";

export const useConversationParticipantQuery = (
  conversationId: number,
  keyword: string = "",
) => {
  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQuery({
    queryKey: conversationQueryKeys.ConversationParticipants(
      conversationId,
      keyword,
    ),
    queryFn: (pageParam: number) =>
      getConversationParticipants(conversationId, keyword, pageParam, 10),
    options: {
      staleTime: 5 * 60 * 1000, // 5 minutes stale time
    },
    initialPageParam: 0,
  });

  return {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
};
