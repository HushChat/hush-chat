import { usePaginatedQuery } from "@/query/usePaginatedQuery";
import { workspaceQueryKeys } from "@/constants/queryKeys";
import { getAllWorkspaceUsers } from "@/apis/user";

export const useWorkspaceUsersQuery = () => {
  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQuery({
    queryKey: workspaceQueryKeys.workspaceUsers(),
    queryFn: (pageParam: number) => getAllWorkspaceUsers(pageParam, 15),
    options: {
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
    initialPageParam: 0,
  });

  return {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
};
