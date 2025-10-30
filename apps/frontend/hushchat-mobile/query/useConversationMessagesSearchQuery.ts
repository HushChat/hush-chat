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

import { searchConversationMessages } from "@/apis/conversation";
import { useQuery } from "@tanstack/react-query";

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
    queryKey: ["searched-conversation-messages", conversationId, searchQuery],
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
