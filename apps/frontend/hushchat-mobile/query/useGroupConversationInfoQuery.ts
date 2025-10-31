import { getGroupProfile } from "@/apis/conversation";
import { GroupProfile } from "@/types/chat/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useUserStore } from "@/store/user/useUserStore";
import { conversationQueryKeys } from "@/constants/queryKeys";

export function useGroupConversationInfoQuery(conversationId: number): {
  conversationInfo: GroupProfile | undefined;
  isLoadingConversationInfo: boolean;
  conversationInfoError: Error | null;
  refetch: () => Promise<unknown>;
  invalidateConversationInfo: () => void;
} {
  const {
    user: { id: userId },
  } = useUserStore();

  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<GroupProfile>({
    queryKey: conversationQueryKeys.groupProfileInfo(Number(userId), conversationId),
    queryFn: () => getGroupProfile(conversationId),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  const invalidateConversationInfo = () => {
    queryClient.invalidateQueries({
      queryKey: conversationQueryKeys.groupProfileInfo(Number(userId), conversationId),
    });
  };

  return {
    conversationInfo: data,
    isLoadingConversationInfo: isLoading,
    conversationInfoError: error,
    refetch,
    invalidateConversationInfo,
  };
}
