import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import {
  CursorPaginatedQueryOptions,
  CursorPaginatedResponse,
} from "@/apis/conversation";

type TPageParam = {
  beforeId?: number;
  afterId?: number;
};

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
    fetchPreviousPage,
    hasNextPage,
    hasPreviousPage,
    isFetchingNextPage,
    isFetchingPreviousPage,
    refetch,
  } = useInfiniteQuery<CursorPaginatedResponse<T>>({
    queryKey,
    enabled,
    initialPageParam: { beforeId: undefined, afterId: undefined },
    queryFn: async ({ pageParam }) => {
      const { beforeId, afterId } = pageParam as TPageParam;
      const response = await queryFn({ beforeId, afterId, size: pageSize });
      if (!response.data)
        throw new Error(response.error || "Failed to fetch data");
      return response.data;
    },

    getNextPageParam: (lastPage) => {
      const content = lastPage?.content ?? [];

      if (content.length < pageSize) {
        return undefined;
      }

      const oldestMessage = content[content.length - 1];
      return { beforeId: Number(oldestMessage?.id), afterId: undefined };
    },

    getPreviousPageParam: (firstPage) => {
      const content = firstPage?.content ?? [];

      if (content.length < pageSize) {
        return undefined;
      }

      const newestMessage = content[0];
      return { beforeId: undefined, afterId: Number(newestMessage?.id) };
    },

    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  return {
    pages,
    isLoading,
    error: error as Error | null,
    fetchOlder: fetchNextPage,
    fetchNewer: fetchPreviousPage,
    hasMoreOlder: hasNextPage ?? false,
    hasMoreNewer: hasPreviousPage ?? false,
    isFetchingOlder: isFetchingNextPage,
    isFetchingNewer: isFetchingPreviousPage,
    refetch,
    invalidateQuery: () => queryClient.invalidateQueries({ queryKey }),
  };
}
