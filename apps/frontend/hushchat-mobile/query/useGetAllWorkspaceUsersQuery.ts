import { getAllWorkspaceUsers } from "@/apis/user";
import { PagePaginatedQueryResult, usePaginatedQuery } from "@/query/usePaginatedQuery";
import { IWorkspaceUser } from "@/types/workspace-user/types";

type TUseGetAllWorkspaceUsersQueryResult = {
  workspaceUsersPages: PagePaginatedQueryResult<IWorkspaceUser>["pages"];
  isLoadingWorkspaceUsers: boolean;
  workspaceUsersError: Error | null;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => Promise<unknown>;
  invalidateQuery: () => void;
};

export const useGetAllWorkspaceUsersQuery = (
  searchKeyword: string = ""
): TUseGetAllWorkspaceUsersQueryResult => {
  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQuery<IWorkspaceUser>({
    queryKey: ["workspace-users", searchKeyword],
    queryFn: (pageParam: number) => getAllWorkspaceUsers(searchKeyword, pageParam, 10),
    initialPageParam: 0,
  });

  return {
    workspaceUsersPages: pages,
    isLoadingWorkspaceUsers: isLoading,
    workspaceUsersError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
};
