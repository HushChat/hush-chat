import { IConversation, ConversationType } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import { useConversationStore } from "@/store/conversation/useConversationStore"; // Import Store
import { ConversationFilterCriteria, getAllConversations } from "@/apis/conversation";
import {
  OffsetPaginatedQueryResult,
  usePaginatedQueryWithOffset,
} from "@/query/usePaginatedQueryWithOffset";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { useMemo } from "react";

const PAGE_SIZE = 20;

const getCriteriaFromType = (type: ConversationType): ConversationFilterCriteria => {
  switch (type) {
    case ConversationType.ARCHIVED:
      return { isArchived: true };

    case ConversationType.FAVORITES:
      return { isFavorite: true, isArchived: false };

    case ConversationType.MUTED:
      return { isMuted: true, isArchived: false };

    case ConversationType.GROUPS:
      return { isGroup: true, isArchived: false } as any;

    case ConversationType.UNREAD:
      return { hasUnread: true, isArchived: false } as any;

    case ConversationType.ALL:
    default:
      return { isArchived: false };
  }
};

export function useConversationsQuery(
  criteriaOverrides: ConversationFilterCriteria = {},
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

  const { selectedConversationType } = useConversationStore();

  const activeCriteria = useMemo(() => {
    const baseCriteria = getCriteriaFromType(selectedConversationType);
    return { ...baseCriteria, ...criteriaOverrides };
  }, [selectedConversationType, criteriaOverrides]);

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
    queryKey: conversationQueryKeys.allConversations(Number(userId), activeCriteria),

    queryFn: (pageParam: number, pageSize: number) =>
      getAllConversations(activeCriteria, pageParam, pageSize),

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
