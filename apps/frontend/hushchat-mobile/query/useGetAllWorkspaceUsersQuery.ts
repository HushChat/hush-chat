import { PagePaginatedQueryResult, usePaginatedQuery } from "@/query/usePaginatedQuery";
import { getAllWorkspaceUsers } from "@/apis/admin";

export type TWorkspaceUser = {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  imageIndexedName: string | null;
  status: "ACTIVE" | "PENDING" | "SUSPENDED";
};

type TUseGetAllWorkspaceUsersQueryResult = {
  usersPages: PagePaginatedQueryResult<TWorkspaceUser>["pages"];
  isLoadingUsers: boolean;
  usersError: Error | null;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => Promise<unknown>;
};

export const useGetAllWorkspaceUsersQuery = (
  keyword: string = ""
): TUseGetAllWorkspaceUsersQueryResult => {
  const { pages, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage, refetch } =
    usePaginatedQuery<TWorkspaceUser>({
      queryKey: ["workspace-users", keyword],
      queryFn: (pageParam: number) => getAllWorkspaceUsers(keyword, pageParam, 20),
      initialPageParam: 0,
    });

  return {
    usersPages: pages,
    isLoadingUsers: isLoading,
    usersError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  };
};
