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

export interface PagePaginatedResponse<T> extends PaginatedResponse<T> {
  total: number;
  pageable: { pageNumber: number };
}

export type PageQueryFnType<T> = (
  pageParam: number,
) => Promise<ApiResponse<PagePaginatedResponse<T>>>;

export interface PagePaginatedQueryOptions<T> {
  queryKey: QueryKey;
  queryFn: PageQueryFnType<T>;
  initialPageParam?: number;
  getNextPageParam?: (lastPage: PagePaginatedResponse<T>) => number | undefined;
  options?: Record<string, unknown>;
}

export interface PagePaginatedQueryResult<T> extends PaginatedQueryResult {
  fetchNextPage: () => Promise<unknown>;
  pages: InfiniteData<PagePaginatedResponse<T>> | undefined;
}

export function usePaginatedQuery<T>({
  queryKey,
  queryFn,
  initialPageParam = 0,
  getNextPageParam = (lastPage: PagePaginatedResponse<T>) =>
    lastPage.last ? undefined : lastPage.pageable.pageNumber + 1,
  options,
}: PagePaginatedQueryOptions<T>): PagePaginatedQueryResult<T> {
  const queryClient = useQueryClient();

  const {
    data: pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useInfiniteQuery({
    queryKey,
    queryFn: async ({ pageParam = initialPageParam }) => {
      const response = await queryFn(pageParam);
      if (response.data) return response.data;
      throw new Error(response.error || `Failed to fetch data`);
    },
    getNextPageParam,
    initialPageParam,
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
