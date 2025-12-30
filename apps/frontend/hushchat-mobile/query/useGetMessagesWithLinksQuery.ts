import { getMessagesWithLink } from "@/apis/conversation";
import { conversationMessageQueryKeys } from "@/constants/queryKeys";
import { usePaginatedQuery } from "./usePaginatedQuery";
import { IMessage } from "@/types/chat/types";

export const useGetMessagesWithLinksQuery = (conversationId: number, pageSize: number = 15) => {
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
    queryKey: conversationMessageQueryKeys.messagesWithLink(conversationId, pageSize),
    queryFn: (pageParam: number) => getMessagesWithLink(conversationId, pageParam, pageSize),
    options: {
      staleTime: 0,
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
