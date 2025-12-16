import { messageQueryKeys } from "@/constants/queryKeys";
import { usePaginatedQuery } from "@/query/usePaginatedQuery";
import { IMentionedMessage } from "@/types/chat/types";
import { getMentionedMessages } from "@/apis/message";

export function useGetAllMentionedMessages() {
  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQuery<IMentionedMessage>({
    queryKey: messageQueryKeys.mentionedMessages,
    queryFn: (pageParam: number) => getMentionedMessages(pageParam, 10),
    initialPageParam: 0,
  });

  return {
    mentionedMessagePages: pages,
    isLoadingMentionedMessages: isLoading,
    mentionedMessageError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
}
