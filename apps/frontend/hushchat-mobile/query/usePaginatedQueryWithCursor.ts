import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { CursorPaginatedQueryOptions, CursorPaginatedResponse } from "@/apis/conversation";

type PageParam = {
  cursor: number | string | undefined;
  direction: "older" | "newer";
};

interface ExtendedOptions<T> extends CursorPaginatedQueryOptions<T> {
  enableNewer?: boolean;
}

export function usePaginatedQueryWithCursor<T extends { id: number | string }>({
  queryKey,
  queryFn,
  pageSize = 20,
  enabled = true,
  enableNewer = false,
}: ExtendedOptions<T>) {
  const queryClient = useQueryClient();

  const {
    data: pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    refetch,
  } = useInfiniteQuery<CursorPaginatedResponse<T>>({
    queryKey,
    enabled,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const payload: any = { size: pageSize };

      if (pageParam) {
        const { cursor, direction } = pageParam as PageParam;
        if (direction === "older") payload.beforeId = Number(cursor);
        if (direction === "newer") payload.afterId = Number(cursor);
      }

      const response = await queryFn(payload);
      if (!response.data) throw new Error(response.error || "Failed to fetch data");
      return response.data;
    },

    getNextPageParam: (lastPage) => {
      const content = lastPage?.content ?? [];
      if (content.length < pageSize) return undefined;

      const oldestMessage = content[content.length - 1];
      return oldestMessage ? { cursor: oldestMessage.id, direction: "older" } : undefined;
    },

    getPreviousPageParam: (firstPage) => {
      if (!enableNewer) return undefined;
      const content = firstPage?.content ?? [];
      if (content.length < pageSize) return undefined;
      const newestMessage = content[0];
      return newestMessage ? { cursor: newestMessage.id, direction: "newer" } : undefined;
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
    fetchNewer: fetchPreviousPage,
    hasMoreNewer: hasPreviousPage ?? false,
    isFetchingNewer: isFetchingPreviousPage,
    refetch,
    invalidateQuery: () => queryClient.invalidateQueries({ queryKey }),
  };
}
