import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { CursorPaginatedQueryOptions, CursorPaginatedResponse } from "@/apis/conversation";

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
      if (!response.data) throw new Error(response.error || "Failed to fetch data");
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
