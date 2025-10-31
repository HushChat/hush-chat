import { useUserStore } from "@/store/user/useUserStore";
import { usePaginatedQuery, PagePaginatedQueryResult } from "@/query/usePaginatedQuery";
import { getAllCallLogs } from "@/apis/conversation";
import { ICallLog } from "@/types/call/types";
import { userQueryKeys } from "@/constants/queryKeys";

export function useCallLogsQuery(): {
  callLogsPages: PagePaginatedQueryResult<ICallLog>["pages"];
  isLoadingCallLogs: boolean;
  callLogsError: Error | null;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  refetchCallLogs: () => void;
} {
  const {
    user: { id: userId },
  } = useUserStore();

  const {
    pages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    invalidateQuery,
  } = usePaginatedQuery<ICallLog>({
    queryKey: userQueryKeys.callLogs(Number(userId)),
    queryFn: getAllCallLogs,
    initialPageParam: 0,
  });

  return {
    callLogsPages: pages,
    isLoadingCallLogs: isLoading,
    callLogsError: error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetchCallLogs: invalidateQuery,
  };
}
