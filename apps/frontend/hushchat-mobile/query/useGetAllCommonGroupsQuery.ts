import { Conversation } from "@/types/chat/types";
import { usePaginatedQuery } from "@/query/usePaginatedQuery";
import { useMemo } from "react";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { getCommonGroups } from "@/apis/conversation";

type TUseGetAllMessageSeenParticipantsResult = Readonly<{
  commonGroupConversations: readonly Conversation[];
  isLoadingCommonGroupConversations: boolean;
  commonGroupConversationsError: unknown;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  invalidateQuery: (() => void) | undefined;
  refetch: () => Promise<unknown>;
}>;

export function useGetAllCommonGroupsQuery(
  conversationId: number
): TUseGetAllMessageSeenParticipantsResult {
  const {
    pages: pageData,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQuery<Conversation>({
    queryKey: conversationQueryKeys.commonGroupInfo(conversationId),
    queryFn: (pageParam: number) => getCommonGroups(conversationId, pageParam, 10),
    initialPageParam: 0,
  });

  const commonGroups = useMemo(() => {
    return pageData?.pages.flatMap((page) => page.content ?? []) ?? [];
  }, [pageData]);

  return {
    commonGroupConversations: commonGroups,
    isLoadingCommonGroupConversations: isLoading,
    commonGroupConversationsError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
}
