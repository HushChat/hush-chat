/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { globalSearch } from "@/apis/conversation";
import { ISearchResults } from "@/types/chat/types";
import { useQuery } from "@tanstack/react-query";

/**
 * To search across users, conversations, and messages globally
 */
export default function useGlobalSearchQuery(searchQuery: string) {
  const {
    data: searchResults = {} as ISearchResults,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["global-search", searchQuery],
    queryFn: () => globalSearch(searchQuery),
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
