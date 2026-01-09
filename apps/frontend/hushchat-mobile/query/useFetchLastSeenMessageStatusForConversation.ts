import { getLastSeenMessageByConversationId } from "@/apis/conversation";
import { ConversationReadInfo } from "@/types/chat/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { useCallback } from "react";

export function useFetchLastSeenMessageStatusForConversation(conversationId: number): {
  lastSeenMessageInfo: ConversationReadInfo | undefined;
  isLoadingLastSeenMessageInfo: boolean;
  lastSeenMessageInfoError: Error | null;
  lastSeenMessageInfoRefetch: () => Promise<unknown>;
  updateLastSeenMessageStatusForConversationCache: (
    conversationId: number,
    newData: ConversationReadInfo
  ) => void;
} {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<ConversationReadInfo>({
    queryKey: conversationQueryKeys.lastSeenMessage(conversationId),
    queryFn: () => getLastSeenMessageByConversationId(conversationId),
    enabled: !!conversationId,
  });

  const updateLastSeenMessageStatusForConversationCache = useCallback(
    (conversationId: number, newData: ConversationReadInfo) => {
      queryClient.setQueryData<ConversationReadInfo>(
        conversationQueryKeys.lastSeenMessage(conversationId),
        (oldData) => {
          if (!oldData) return oldData;

          return { ...newData };
        }
      );
    },
    [queryClient, conversationId]
  );

  return {
    lastSeenMessageInfo: data,
    isLoadingLastSeenMessageInfo: isLoading,
    lastSeenMessageInfoError: error,
    lastSeenMessageInfoRefetch: refetch,
    updateLastSeenMessageStatusForConversationCache,
  };
}
