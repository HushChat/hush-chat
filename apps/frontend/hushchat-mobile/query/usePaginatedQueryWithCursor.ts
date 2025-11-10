import { useRef } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { CursorPaginatedQueryOptions, CursorPaginatedResponse } from "@/apis/conversation";

type TPageParam = {
  beforeId?: number;
  afterId?: number;
};

export function usePaginatedQueryWithCursor<T extends { id: number | undefined }>({
  queryKey,
  queryFn,
  pageSize = 20,
  enabled = true,
}: CursorPaginatedQueryOptions<T>) {
  const queryClient = useQueryClient();
  const isJumpingRef = useRef(false);

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
      if (!response.data) throw new Error(response.error || "Failed to fetch data");
      return response.data;
    },

    getNextPageParam: (lastPage) => {
      const content = lastPage?.content ?? [];
      if (content.length < pageSize) return undefined;

      const oldestMessage = content[content.length - 1];
      return { beforeId: Number(oldestMessage?.id), afterId: undefined };
    },

    getPreviousPageParam: (firstPage) => {
      if (!isJumpingRef.current) return undefined;

      const content = firstPage?.content ?? [];
      if (content.length < pageSize) return undefined;

      const newestMessage = content[0];
      return { beforeId: undefined, afterId: Number(newestMessage?.id) };
    },

    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  const setJumping = (state: boolean) => {
    isJumpingRef.current = state;
  };

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
    setJumping,
    invalidateQuery: () => queryClient.invalidateQueries({ queryKey }),
  };
}
