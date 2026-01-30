import { useMemo } from "react";
import { useGlobalSearchParams } from "expo-router";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { getCriteria } from "@/utils/conversationUtils";

export const useConversationList = () => {
  const { selectedConversationType, setSelectedConversationType } = useConversationStore();

  const { id } = useGlobalSearchParams<{ id?: string }>();
  const selectedConversationId = id ? Number(id) : null;

  const conversationQueryCriteria = useMemo(
    () => getCriteria(selectedConversationType),
    [selectedConversationType]
  );

  const {
    conversationsPages,
    isLoadingConversations,
    conversationsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useConversationsQuery(conversationQueryCriteria);

  const conversations = useMemo(
    () => conversationsPages?.pages.flatMap((page) => page.content) ?? [],
    [conversationsPages]
  );

  const selectedConversation = useMemo(() => {
    if (!selectedConversationId) return null;

    return conversations.find((conversation) => conversation.id === selectedConversationId) ?? null;
  }, [conversations, selectedConversationId]);

  return {
    selectedConversationType,
    setSelectedConversationType,
    selectedConversationId,
    selectedConversation,
    conversations,
    isLoadingConversations,
    conversationsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};
