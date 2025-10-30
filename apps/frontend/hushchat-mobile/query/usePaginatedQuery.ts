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
