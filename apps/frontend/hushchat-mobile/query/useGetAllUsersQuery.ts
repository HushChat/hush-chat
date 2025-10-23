import { PaginatedQueryResult, usePaginatedQuery } from '@/query/usePaginatedQuery';
import { TUser } from '@/types/user/types';
import { getAllUsers } from '@/apis/user';

type TUseGetAllUsersQueryResult = {
  usersPages: PaginatedQueryResult<TUser>['pages'];
  isLoadingUsers: boolean;
  usersError: Error | null;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => Promise<unknown>;
  invalidateQuery: () => void;
};

export const useGetAllUsersQuery = (
  keyword: string = '',
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
    queryKey: ['users', keyword],
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
