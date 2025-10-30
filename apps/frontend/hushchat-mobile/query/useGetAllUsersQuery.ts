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
  PaginatedQueryResult,
  usePaginatedQuery,
} from "@/query/usePaginatedQuery";
import { TUser } from "@/types/user/types";
import { getAllUsers } from "@/apis/user";

type TUseGetAllUsersQueryResult = {
  usersPages: PaginatedQueryResult<TUser>["pages"];
  isLoadingUsers: boolean;
  usersError: Error | null;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => Promise<unknown>;
  invalidateQuery: () => void;
};

export const useGetAllUsersQuery = (
  keyword: string = "",
  excludeUsersInConversationId?: number,
): TUseGetAllUsersQueryResult => {
  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQuery<TUser>({
    queryKey: ["users", keyword],
    queryFn: (pageParam: number) =>
      getAllUsers(keyword, excludeUsersInConversationId, pageParam, 10),
    initialPageParam: 0,
  });

  return {
    usersPages: pages,
    isLoadingUsers: isLoading,
    usersError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
};
