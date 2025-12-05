import { getConversationAttachments } from "@/apis/conversation";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { usePaginatedQuery } from "./usePaginatedQuery";

export const useConversationAttachmentsQuery = (
  conversationId: number,
  pageSize: number = 15,
  type: string = ""
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
    queryKey: conversationQueryKeys.conversationAttachments(conversationId, type, pageSize),
    queryFn: (pageParam: number) =>
      getConversationAttachments(conversationId, type, pageParam, pageSize),
    options: {
      staleTime: 0, // cache for 5 minutes
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
