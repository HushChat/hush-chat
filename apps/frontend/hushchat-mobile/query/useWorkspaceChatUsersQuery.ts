import { PaginatedQueryResult, usePaginatedQuery } from "@/query/usePaginatedQuery";
import { TUser } from "@/types/user/types";
import { getWorkspaceChatUsers } from "@/apis/user";

type TUseWorkspaceChatUsersQueryResult = {
  usersPages: PaginatedQueryResult<TUser>["pages"];
  isLoadingUsers: boolean;
  usersError: Error | null;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetch: () => Promise<unknown>;
  invalidateQuery: () => void;
};

export const useWorkspaceChatUsersQuery = (
  keyword: string = ""
): TUseWorkspaceChatUsersQueryResult => {
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
    queryKey: ["workspace-chat-users", keyword],
    queryFn: (pageParam: number) => getWorkspaceChatUsers(keyword, pageParam, 10),
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
