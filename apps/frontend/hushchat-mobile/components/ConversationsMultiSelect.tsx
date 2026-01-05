import React, { useState } from "react";
import { MultiSelectList } from "@/components/MultiSelectList";
import { SelectedChip } from "@/components/SelectedChip";
import { SelectableListItem } from "@/components/SelectableListItem";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import useGlobalSearchQuery from "@/query/useGlobalSearchQuery";
import { PaginatedResponse } from "@/types/common/types";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { getCriteria } from "@/utils/conversationUtils";
import { ISearchResults, IConversation } from "@/types/chat/types";
import { TUser } from "@/types/user/types";
import useDebounce from "@/hooks/useDebounce";

export type TConversation = IConversation | TUser;

export interface ConversationsMultiSelectProps {
  selectedConversations: TConversation[];
  onChange: (nextSelected: TConversation[]) => void;
  searchPlaceholder?: string;
  sourceConversationId?: number;
}

const SEARCH_DEBOUNCE_MS = 500;

const getDisplayName = (conversation: TConversation) => {
  if ("name" in conversation) {
    return (conversation.name ?? "").trim() || "Untitled Conversation";
  }
  if ("username" in conversation) {
    return `${conversation.firstName} ${conversation.lastName}`.trim() || "Unknown User";
  }
  return "Unknown";
};

const getSubText = (conversation: TConversation) => {
  if ("email" in conversation) return conversation.email ?? "";
  return "";
};

export const ConversationsMultiSelect = ({
  selectedConversations,
  onChange,
  searchPlaceholder = "Search conversations...",
  sourceConversationId,
}: ConversationsMultiSelectProps) => {
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, SEARCH_DEBOUNCE_MS).trim();

  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);

  const {
    conversationsPages,
    isLoadingConversations,
    conversationsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch: refetchConversations,
  } = useConversationsQuery(criteria);

  const { searchResults, isSearching, searchError, refetchSearch } =
    useGlobalSearchQuery(debouncedSearch);

  return (
    <MultiSelectList<TConversation>
      selected={selectedConversations}
      onChange={onChange}
      searchText={searchText}
      setSearchText={setSearchText}
      searchPlaceholder={searchPlaceholder}
      queryResult={{
        pages: debouncedSearch ? searchResults : conversationsPages,
        isLoading: debouncedSearch ? isSearching : isLoadingConversations,
        error: debouncedSearch ? (searchError ?? null) : (conversationsError ?? null),
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        refetch: debouncedSearch ? refetchSearch : refetchConversations,
      }}
      getKey={(conversation) => conversation.id}
      extractData={(dataPages) => {
        if (!dataPages) return [];

        if (debouncedSearch) {
          const { chats = [], users = [] } = (dataPages as ISearchResults) ?? {};
          return [...chats, ...users].filter((item) => item.id !== sourceConversationId);
        }

        const pages = (dataPages as { pages?: PaginatedResponse<IConversation>[] })?.pages ?? [];
        return pages
          .flatMap((page) => page?.content ?? [])
          .filter((item) => item.id !== sourceConversationId);
      }}
      renderItemRow={(conversation, isSelected, toggle) => (
        <SelectableListItem
          title={getDisplayName(conversation)}
          subtitle={getSubText(conversation)}
          isSelected={isSelected}
          onToggle={() => toggle(conversation)}
          imageUrl={conversation.signedImageUrl}
        />
      )}
      renderChip={(conversation, remove) => (
        <SelectedChip
          key={conversation.id}
          label={getDisplayName(conversation)}
          onRemove={() => remove(conversation)}
        />
      )}
    />
  );
};
