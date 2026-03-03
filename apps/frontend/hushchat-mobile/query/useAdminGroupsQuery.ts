import { PaginatedQueryResult, usePaginatedQuery } from "@/query/usePaginatedQuery";
import { AdminGroupListItem, getAdminGroups } from "@/apis/admin-conversation";

type TUseAdminGroupsQueryResult = {
  groupsPages: PaginatedQueryResult<AdminGroupListItem>["pages"];
  isLoadingGroups: boolean;
  groupsError: Error | null;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => Promise<unknown>;
  invalidateQuery: () => void;
};

export const useAdminGroupsQuery = (keyword: string = ""): TUseAdminGroupsQueryResult => {
  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  } = usePaginatedQuery<AdminGroupListItem>({
    queryKey: ["admin-groups", keyword],
    queryFn: (pageParam: number) => getAdminGroups(keyword, pageParam, 20),
    initialPageParam: 0,
  });

  return {
    groupsPages: pages,
    isLoadingGroups: isLoading,
    groupsError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
    refetch,
  };
};
