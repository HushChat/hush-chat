/**
 * Cursor-based pagination hook for messages.
 *
 * fetchNextPage  -> loads older messages (backwards in history)
 * fetchPreviousPage -> loads newer messages (forward, only if enabled)
 *
 * Direction is controlled using:
 *   PAGINATE_BACKWARD  = fetch older (beforeId)
 *   PAGINATE_FORWARD   = fetch newer (afterId)
 *
 * `allowForwardPagination` must be true to load forward pages.
 */
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { CursorPaginatedQueryOptions, CursorPaginatedResponse } from "@/apis/conversation";

export const PAGINATE_BACKWARD = "paginate_backward" as const;
export const PAGINATE_FORWARD = "paginate_forward" as const;

type TPageParam = {
  cursor: number | string | undefined;
  direction: typeof PAGINATE_BACKWARD | typeof PAGINATE_FORWARD;
};

function buildCursorQuery(param?: TPageParam) {
  if (!param) return {};

  const cursor = Number(param.cursor);

  const directionMap = {
    [PAGINATE_BACKWARD]: { beforeId: cursor },
    [PAGINATE_FORWARD]: { afterId: cursor },
  } satisfies Record<TPageParam["direction"], Record<string, number>>;

  return directionMap[param.direction];
}

export function usePaginatedQueryWithCursor<T extends { id: number | string }>({
  queryKey,
  queryFn,
  pageSize = 20,
  enabled = true,
  allowForwardPagination = false,
  retry,
  refetchOnMount,
}: CursorPaginatedQueryOptions<T>) {
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
    retry,
    initialPageParam: undefined,
    queryFn: async ({ pageParam }) => {
      const cursorQuery = buildCursorQuery(pageParam as TPageParam);

      const result = await queryFn({ size: pageSize, ...cursorQuery });
      if (!result.data) throw new Error(result.error ?? "Query failed");

      return result.data;
    },

    getNextPageParam: (lastLoadedPage) => {
      if (!lastLoadedPage?.content?.length) return undefined;

      if ("hasMoreBefore" in lastLoadedPage) {
        if (lastLoadedPage.hasMoreBefore === false) return undefined;
      } else {
        if (lastLoadedPage.content.length < pageSize) return undefined;
      }

      const oldestMessageInCurrentPage = lastLoadedPage.content[lastLoadedPage.content.length - 1];
      if (!oldestMessageInCurrentPage) return undefined;

      return {
        cursor: oldestMessageInCurrentPage.id,
        direction: PAGINATE_BACKWARD,
      };
    },

    getPreviousPageParam: (firstLoadedPage) => {
      if (!allowForwardPagination) return undefined;
      if (!firstLoadedPage?.content?.length) return undefined;

      if ("hasMoreAfter" in firstLoadedPage) {
        if (firstLoadedPage.hasMoreAfter === false) return undefined;
      } else {
        const hasInsufficientMessagesToPaginate = firstLoadedPage.content.length < pageSize;
        if (hasInsufficientMessagesToPaginate) return undefined;
      }

      const newestMessageInCurrentPage = firstLoadedPage.content[0];
      if (!newestMessageInCurrentPage) return undefined;

      return {
        cursor: newestMessageInCurrentPage.id,
        direction: PAGINATE_FORWARD,
      };
    },

    refetchOnMount: refetchOnMount || false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  return {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    fetchPreviousPage,
    hasPreviousPage,
    isFetchingPreviousPage,
    refetch,
    invalidateQuery: () => queryClient.invalidateQueries({ queryKey }),
  };
}
