import { getOtherParticipantProfile } from '@/apis/conversation';
import { oneToOneChatInfo } from '@/types/chat/types';
import { useQuery } from '@tanstack/react-query';
import { useUserStore } from '@/store/user/useUserStore';
import { conversationQueryKeys } from '@/constants/queryKeys';

export function useOneToOneConversationInfoQuery(conversationId: number): {
  conversationInfo: oneToOneChatInfo | undefined;
  isLoadingConversationInfo: boolean;
  conversationInfoError: Error | null;
  refetch: () => Promise<unknown>;
} {
  const {
    user: { id: userId },
  } = useUserStore();

  const { data, isLoading, error, refetch } = useQuery<oneToOneChatInfo>({
    queryKey: conversationQueryKeys.participantProfileInfo(Number(userId), conversationId),
    queryFn: () => getOtherParticipantProfile(conversationId),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  return {
    conversationInfo: data,
    isLoadingConversationInfo: isLoading,
    conversationInfoError: error,
    refetch,
  };
}
