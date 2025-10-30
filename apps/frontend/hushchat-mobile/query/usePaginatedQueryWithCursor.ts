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

import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  CursorPaginatedQueryOptions,
  CursorPaginatedResponse,
} from "@/apis/conversation";

/**
 * A simplified hook for paginating (older) messages.
 * It only handles the initial load and fetching the next page (older items).
 * New items are expected to be handled by a WebSocket.
 */
export function usePaginatedQueryWithCursor<T extends { id: number | string }>({
  queryKey,
  queryFn,
  pageSize = 20,
  enabled = true,
}: CursorPaginatedQueryOptions<T>) {
  const queryClient = useQueryClient();

  const {
    data: pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery<CursorPaginatedResponse<T>>({
    queryKey,
    enabled,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const response = await queryFn({
        beforeId: Number(pageParam),
        size: pageSize,
      });
      if (!response.data)
        throw new Error(response.error || "Failed to fetch data");
      return response.data;
    },
    getNextPageParam: (lastPage) => {
      const content = lastPage?.content ?? [];
      if (content.length < pageSize) return undefined;

      const oldestMessage = content[content.length - 1];
      return oldestMessage?.id;
    },
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    pages,
    isLoading,
    error: error as Error | null,
    fetchOlder: fetchNextPage,
    hasMoreOlder: hasNextPage ?? false,
    isFetchingOlder: isFetchingNextPage,
    refetch,
    invalidateQuery: () => queryClient.invalidateQueries({ queryKey }),
  };
}
