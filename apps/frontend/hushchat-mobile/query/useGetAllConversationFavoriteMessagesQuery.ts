import { usePaginatedQuery } from "@/query/usePaginatedQuery";
import { IMessage } from "@/types/chat/types";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { getFavoriteMessages } from "@/apis/conversation";

export function useGetAllConversationFavoriteMessagesQuery(conversationId: number) {
  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQuery<IMessage>({
    queryKey: conversationQueryKeys.favoriteMessages(conversationId),
    queryFn: (pageParam: number) => getFavoriteMessages(conversationId, pageParam, 10),
    initialPageParam: 0,
  });

  return {
    favoriteMessagePages: pages,
    isLoadingFavoriteMessages: isLoading,
    favoriteMessageError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
}
