import { messageQueryKeys } from "@/constants/queryKeys";
import { usePaginatedQuery } from "@/query/usePaginatedQuery";
import { IMentionedMessage } from "@/types/chat/types";
import { getMentionedMessages } from "@/apis/message";
import { useMemo } from "react";

type UseGetAllMentionedMessagesResult = Readonly<{
  mentionedMessages: readonly IMentionedMessage[];
  isLoadingMentionedMessages: boolean;
  mentionedMessagesError: unknown;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  invalidateQuery: (() => void) | undefined;
  refetch: () => Promise<unknown>;
}>;

export function useGetAllMentionedMessages(): UseGetAllMentionedMessagesResult {
  const {
    pages: pageData,
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

  const mentionedMessages = useMemo(() => {
    return pageData?.pages.flatMap((page) => page.content ?? []) ?? [];
  }, [pageData]);

  return {
    mentionedMessages,
    isLoadingMentionedMessages: isLoading,
    mentionedMessagesError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
}
