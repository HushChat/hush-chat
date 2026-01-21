import { useMemo } from "react";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { getCriteria } from "@/utils/conversationUtils";
import { useGlobalSearchParams } from "expo-router";

export const useConversationList = () => {
  const { selectedConversationType, setSelectedConversationType } = useConversationStore();

  const { id } = useGlobalSearchParams<{ id?: string }>();
  const selectedConversationId = id ? Number(id) : null;

  const criteria = useMemo(() => getCriteria(selectedConversationType), [selectedConversationType]);

  const {
    conversationsPages,
    isLoadingConversations,
    conversationsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useConversationsQuery(criteria);

  const conversations = useMemo(
    () => conversationsPages?.pages.flatMap((page) => page.content) ?? [],
    [conversationsPages]
  );

  const selectedConversation = useMemo(
    () =>
      selectedConversationId
        ? (conversations.find((c) => c.id === selectedConversationId) ?? null)
        : null,
    [conversations, selectedConversationId]
  );

  return {
    selectedConversationType,
    setSelectedConversationType,
    selectedConversationId,
    conversations,
    selectedConversation,
    isLoadingConversations,
    conversationsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};
