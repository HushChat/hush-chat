import { IConversation } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import { ConversationFilterCriteria, getAllConversations } from "@/apis/conversation";
import {
  OffsetPaginatedQueryResult,
  usePaginatedQueryWithOffset,
} from "@/query/usePaginatedQueryWithOffset";
import { conversationQueryKeys } from "@/constants/queryKeys";

const PAGE_SIZE = 20;

export function useConversationsQuery(
  criteria: ConversationFilterCriteria = {},
  initialOffset: number = 0
): {
  conversationsPages: OffsetPaginatedQueryResult<IConversation>["pages"];
  isLoadingConversations: boolean;
  conversationsError: Error | null;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetchConversations: (() => void) | undefined;
  refetch: () => Promise<unknown>;
} {
  const {
    user: { id: userId },
  } = useUserStore();

  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQueryWithOffset<IConversation>({
    queryKey: conversationQueryKeys.allConversations(Number(userId), criteria),
    queryFn: (pageParam: number, pageSize: number) =>
      getAllConversations(criteria, pageParam, pageSize),
    pageSize: PAGE_SIZE,
    initialOffset,
  });

  return {
    conversationsPages: pages,
    isLoadingConversations: isLoading,
    conversationsError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetchConversations: invalidateQuery,
    refetch,
  };
}
