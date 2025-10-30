import {
  useQueryClient,
  useInfiniteQuery,
  InfiniteData,
  QueryKey,
} from "@tanstack/react-query";
import type {
  PaginatedResponse,
  ApiResponse,
  PaginatedQueryResult,
} from "@/types/common/types";

export interface OffsetPaginatedResponse<T> extends PaginatedResponse<T> {
  pageable: { offset: number; pageSize: number };
}

export type OffsetQueryFnType<T> = (
  offset: number,
  size: number,
) => Promise<ApiResponse<OffsetPaginatedResponse<T>>>;

export interface OffsetPaginatedQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: OffsetQueryFnType<T>;
  pageSize: number;
  initialOffset?: number;
  getNextPageParam?: (
    lastPage: OffsetPaginatedResponse<T>,
    pageSize: number,
  ) => number | undefined;
  options?: Record<string, unknown>;
}

export interface OffsetPaginatedQueryResult<T> extends PaginatedQueryResult {
  fetchNextPage: () => Promise<any>;
  pages: InfiniteData<OffsetPaginatedResponse<T>> | undefined;
}

export function usePaginatedQueryWithOffset<T>({
  queryKey,
  queryFn,
  pageSize,
  initialOffset = 0,
  options,
}: OffsetPaginatedQueryOptions<T>): OffsetPaginatedQueryResult<T> {
  const queryClient = useQueryClient();

  const {
    data: pages,
    isLoading,
    error,
    isFetchingNextPage,
    refetch,
    fetchNextPage,
    hasNextPage,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = initialOffset }) => {
      const response = await queryFn(pageParam, pageSize);
      if (response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch data");
    },
    getNextPageParam: (lastPage: any) => {
      // Backend returns page-based response, not offset-based
      if (!lastPage || lastPage.last) {
        return undefined;
      }

      // Calculate next offset from the page number
      // Since backend accepts offset but returns page number:
      // next offset = (current page number + 1) * page size
      const currentPageNumber = lastPage.number ?? 0;
      const nextOffset = (currentPageNumber + 1) * (lastPage.size ?? pageSize);

      return nextOffset;
    },
    initialPageParam: initialOffset,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...(options || {}),
  });

  const invalidateQuery = () => {
    queryClient.invalidateQueries({ queryKey });
  };

  return {
    pages,
    isLoading,
    error: error as Error | null,
    fetchNextPage,
    hasNextPage: hasNextPage ?? false,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
}
