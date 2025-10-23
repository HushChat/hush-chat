import { searchConversationMessages } from '@/apis/conversation';
import { useQuery } from '@tanstack/react-query';

export default function useConversationMessagesSearchQuery(
  conversationId: number,
  searchQuery: string,
) {
  const {
    data: messages = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['searched-conversation-messages', conversationId, searchQuery],
    queryFn: () => searchConversationMessages(conversationId, searchQuery),
    enabled: !!conversationId && searchQuery.length > 0,
    staleTime: 0,
  });

  return {
    searchedMessages: messages,
    isLoadingSearchedMessages: isLoading,
    searchedMessagesError: error,
    refetchSearchedMessages: refetch,
  };
}
