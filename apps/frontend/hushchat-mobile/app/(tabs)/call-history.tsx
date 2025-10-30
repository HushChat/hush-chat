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

/**
 * CallHistoryScreen
 *
 * Displays the user's call history in the chat application.
 * Fetches paginated call logs, manages loading/error/refresh states,
 * supports filters (All, Answered, Missed, Video, Audio),
 * and delegates rendering to a factory-selected layout component.
 */

import CallItemList from "@/components/call-history/CallHistoryPanel";
import { useCallLogsQuery } from "@/query/useCallLogsQuery";
import React, { useMemo } from "react";
/* eslint-disable import/no-unresolved */
import CallInterface from "@/components/call-history/CallInterface";

export default function CallHistoryScreen() {
  const {
    callLogsPages,
    isLoadingCallLogs,
    callLogsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetchCallLogs,
  } = useCallLogsQuery();

  const calls = useMemo(
    () => callLogsPages?.pages.flatMap((page) => page.content) ?? [],
    [callLogsPages],
  );

  const filters = [
    { title: "All", isActive: true },
    { title: "Answered", isActive: false },
    { title: "Missed", isActive: false },
    { title: "Video", isActive: false },
    { title: "Audio", isActive: false },
  ];

  const callLogList = (
    <CallItemList
      callLogs={calls}
      callLogsError={callLogsError}
      isCallLogsLoading={isLoadingCallLogs}
      fetchNextPage={fetchNextPage}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      refetchCallLogs={refetchCallLogs}
    />
  );

  return (
    <>
      <CallInterface
        callItemList={callLogList}
        filters={filters}
        isCallLogsLoading={isLoadingCallLogs}
        refetchCallLogs={refetchCallLogs}
      />
    </>
  );
}
