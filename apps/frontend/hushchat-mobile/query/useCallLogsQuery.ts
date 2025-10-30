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

import { useUserStore } from "@/store/user/useUserStore";
import {
  usePaginatedQuery,
  PagePaginatedQueryResult,
} from "@/query/usePaginatedQuery";
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
