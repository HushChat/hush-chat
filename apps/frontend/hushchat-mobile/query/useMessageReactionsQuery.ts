import { usePaginatedQuery } from '@/query/usePaginatedQuery';
import { conversationMessageQueryKeys } from '@/constants/queryKeys';
import { getMessageReactions } from '@/apis/message';

export const useMessageReactionsQuery = (messageId: number) => {
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
    queryKey: conversationMessageQueryKeys.messageReactions(messageId),
    queryFn: (pageParam: number) => getMessageReactions(messageId, pageParam, 10),
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
