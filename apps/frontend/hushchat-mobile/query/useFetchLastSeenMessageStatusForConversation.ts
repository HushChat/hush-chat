import { getLastSeenMessageByConversationId } from "@/apis/conversation";
import { ConversationReadInfo } from "@/types/chat/types";
import { useQuery } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { conversationQueryKeys } from "@/constants/queryKeys";

export function useFetchLastSeenMessageStatusForConversation(conversationId: number): {
  lastSeenMessageInfo: ConversationReadInfo | undefined;
  isLoadingLastSeenMessageInfo: boolean;
  lastSeenMessageInfoError: Error | null;
  lastSeenMessageInfoRefetch: () => Promise<unknown>;
} {
  const {
    user: { id: userId },
  } = useUserStore();

  const { data, isLoading, error, refetch } = useQuery<ConversationReadInfo>({
    queryKey: conversationQueryKeys.participantProfileInfo(Number(userId), conversationId),
    queryFn: () => getLastSeenMessageByConversationId(conversationId),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  return {
    lastSeenMessageInfo: data,
    isLoadingLastSeenMessageInfo: isLoading,
    lastSeenMessageInfoError: error,
    lastSeenMessageInfoRefetch: refetch,
  };
}
