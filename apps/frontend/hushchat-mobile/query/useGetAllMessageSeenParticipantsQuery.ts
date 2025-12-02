import { usePaginatedQuery } from "@/query/usePaginatedQuery";
import { TUser } from "@/types/user/types";
import { getMessageSeenParticipants } from "@/apis/message";

export function useGetAllMessageSeenParticipantsQuery(conversationId: number, messageId: number) {
  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQuery<TUser>({
    queryKey: ["conversation-message-seen-participants", conversationId, messageId],
    queryFn: (pageParam: number) =>
      getMessageSeenParticipants(conversationId, messageId, pageParam, 10),
    initialPageParam: 0,
  });

  return {
    messageSeenParticipantPages: pages,
    isLoadingUsers: isLoading,
    usersError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
}
