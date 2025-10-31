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
