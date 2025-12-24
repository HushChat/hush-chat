import { getInviteLink } from "@/apis/conversation";
import { InviteLink } from "@/types/chat/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationQueryKeys } from "@/constants/queryKeys";

export function useConversationInviteLinkQuery(conversationId: number): {
  conversationInviteLink: InviteLink | undefined;
  isLoadingConversationInviteLink: boolean;
  conversationInviteLinkError: Error | null;
  refetch: () => Promise<unknown>;
  invalidateConversationInviteLink: () => void;
} {
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery<InviteLink>({
    queryKey: conversationQueryKeys.conversationInviteLink(conversationId),
    queryFn: () => getInviteLink(conversationId),
    enabled: !!conversationId,
    staleTime: 5 * 60 * 1000, // 5 minutes stale time
  });

  const invalidateConversationInviteLink = () => {
    queryClient.invalidateQueries({
      queryKey: conversationQueryKeys.conversationInviteLink(conversationId),
    });
  };

  return {
    conversationInviteLink: data,
    isLoadingConversationInviteLink: isLoading,
    conversationInviteLinkError: error,
    refetch,
    invalidateConversationInviteLink: invalidateConversationInviteLink,
  };
}
