import { usePaginatedQuery } from "@/query/usePaginatedQuery";
import { TUser } from "@/types/user/types";
import { getMessageSeenParticipants } from "@/apis/message";
import { useMemo } from "react";

type UseGetAllMessageSeenParticipantsResult = Readonly<{
  messageSeenParticipants: readonly TUser[];
  isLoadingMessageSeenParticipants: boolean;
  messageSeenParticipantsError: unknown;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  invalidateQuery: (() => void) | undefined;
  refetch: () => Promise<unknown>;
}>;

export function useGetAllMessageSeenParticipantsQuery(
  conversationId: number,
  messageId: number
): UseGetAllMessageSeenParticipantsResult {
  const {
    pages: pageData,
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

  const participants = useMemo(() => {
    return pageData?.pages.flatMap((page) => page.content ?? []) ?? [];
  }, [pageData]);

  return {
    messageSeenParticipants: participants,
    isLoadingMessageSeenParticipants: isLoading,
    messageSeenParticipantsError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
}
