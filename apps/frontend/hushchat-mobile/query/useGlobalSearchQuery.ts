import { globalSearch } from "@/apis/conversation";
import { ConversationType, ISearchResults } from "@/types/chat/types";
import { useQuery } from "@tanstack/react-query";

/**
 * To search across users, conversations, and messages globally
 */
export default function useGlobalSearchQuery(
  searchQuery: string,
  selectedConversationType: ConversationType
) {
  const {
    data: searchResults = {} as ISearchResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["global-search", searchQuery],
    queryFn: () => globalSearch(searchQuery, selectedConversationType),
    enabled: searchQuery.length > 0,
    staleTime: 0,
  });

  return {
    searchResults,
    isSearching: isLoading,
    searchError: error,
    refetchSearch: refetch,
  };
}
