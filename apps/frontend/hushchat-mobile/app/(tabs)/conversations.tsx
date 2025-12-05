/**
 * ConversationScreen
 *
 * Main screen for the chat application that displays conversations and handles search functionality.
 *
 * Features:
 * - Fetches paginated conversations from the backend with loading/error/refresh states
 * - Provides filtering options (All, Unread, Favorites)
 * - Global search across users, conversations, and messages with debounced input
 * - Conversation selection and state management
 * - Delegates layout rendering to a dynamically selected component from the factory
 *
 * The screen combines conversation browsing and search functionality in a unified interface,
 * ensuring flexibility in UI presentation through the component factory pattern.
 */
import ConversationListContainer from "@/components/conversations/conversation-list/ConversationListContainer";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import useGlobalSearchQuery from "@/query/useGlobalSearchQuery";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { IConversation, IFilter, ConversationType } from "@/types/chat/types";
import { getCriteria } from "@/utils/conversationUtils";
import { debounce } from "lodash";
import { useEffect, useMemo, useState } from "react";
import ChatInterface from "@/components/conversations/ChatInterface";

export default function ConversationScreen() {
  const { selectedConversationType } = useConversationStore();
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const criteria = useMemo(() => getCriteria(selectedConversationType), [selectedConversationType]);

  const debouncedSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearchQuery.cancel();
    };
  }, [debouncedSearchQuery]);

  const {
    conversationsPages,
    isLoadingConversations,
    conversationsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useConversationsQuery(criteria);

  const { searchResults, isSearching, searchError, refetchSearch } =
    useGlobalSearchQuery(searchQuery);

  const conversations = conversationsPages?.pages.flatMap((page) => page.content) ?? [];

  const filters: IFilter[] = [
    {
      key: ConversationType.ALL,
      label: "All",
      isActive: selectedConversationType === ConversationType.ALL,
    },
    {
      key: ConversationType.UNREAD,
      label: "Unread",
      isActive: selectedConversationType === ConversationType.UNREAD,
    },
    {
      key: ConversationType.FAVORITES,
      label: "Favorites",
      isActive: selectedConversationType === ConversationType.FAVORITES,
    },
    {
      key: ConversationType.GROUPS,
      label: "Groups",
      isActive: selectedConversationType === ConversationType.GROUPS,
    },
    {
      key: ConversationType.MUTED,
      label: "Muted",
      isActive: selectedConversationType === ConversationType.MUTED,
    },
  ];

  const chatItemList = (
    <ConversationListContainer
      conversations={conversations}
      conversationsError={conversationsError?.message}
      conversationsLoading={isLoadingConversations}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      conversationsRefetch={refetch}
      setSelectedConversation={setSelectedConversation}
      selectedConversation={selectedConversation}
      searchedConversationsResult={searchResults}
      isSearchingConversations={isSearching}
      errorWhileSearchingConversation={searchError?.message}
      searchQuery={searchInput}
      refetchSearchResults={refetchSearch}
    />
  );

  return (
    <>
      <ChatInterface
        chatItemList={chatItemList}
        conversationsLoading={isLoadingConversations}
        conversationsRefetch={refetch}
        filters={filters}
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
        onSearchQueryInserting={(searchQuery: string) => {
          setSearchInput(searchQuery);
          debouncedSearchQuery(searchQuery);
        }}
        searchQuery={searchInput}
      />
    </>
  );
}
