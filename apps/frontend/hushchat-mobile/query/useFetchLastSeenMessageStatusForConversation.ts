import { getLastSeenMessageByConversationId } from "@/apis/conversation";
import { ConversationReadInfo } from "@/types/chat/types";
import { useQuery } from "@tanstack/react-query";
import { conversationQueryKeys } from "@/constants/queryKeys";

export function useFetchLastSeenMessageStatusForConversation(conversationId: number): {
  lastSeenMessageInfo: ConversationReadInfo | undefined;
  isLoadingLastSeenMessageInfo: boolean;
  lastSeenMessageInfoError: Error | null;
  lastSeenMessageInfoRefetch: () => Promise<unknown>;
} {
  const { data, isLoading, error, refetch } = useQuery<ConversationReadInfo>({
    queryKey: conversationQueryKeys.lastSeenMessage(conversationId),
    queryFn: () => getLastSeenMessageByConversationId(conversationId),
    enabled: !!conversationId,
  });

  return {
    lastSeenMessageInfo: data,
    isLoadingLastSeenMessageInfo: isLoading,
    lastSeenMessageInfoError: error,
    lastSeenMessageInfoRefetch: refetch,
  };
}
