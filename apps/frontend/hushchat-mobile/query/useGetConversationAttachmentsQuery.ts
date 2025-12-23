import { AttachmentFilterCriteria, getConversationAttachments } from "@/apis/conversation";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { usePaginatedQuery } from "./usePaginatedQuery";
import { IMessageAttachment } from "@/types/chat/types";

export const useConversationAttachmentsQuery = (
  conversationId: number,
  criteria: AttachmentFilterCriteria,
  pageSize: number = 15
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
  } = usePaginatedQuery<IMessageAttachment>({
    queryKey: conversationQueryKeys.conversationAttachments(conversationId, criteria, pageSize),
    queryFn: (pageParam: number) =>
      getConversationAttachments(conversationId, criteria, pageParam, pageSize),
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
