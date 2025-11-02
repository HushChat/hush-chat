/**
 * CallHistoryPanel
 *
 * Renders a scrollable, paginated list of call logs for the chat application.
 * - Displays individual call entries using `CallLogItem`, including direction (incoming/outgoing) and status (missed, rejected).
 *
 * This component is responsible for efficiently rendering the call history UI
 * while managing pagination, error handling, and empty states.
 */
import { useCallback } from "react";
import { ActivityIndicator, FlatList, Text, View } from "react-native";
import Alert from "@/components/Alert";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PLATFORM } from "@/constants/platformConstants";
import { CallDirection, CallStatus, ICallLog } from "@/types/call/types";
import CallLogItem from "@/components/call-history/CallLogItem";
import { useUserStore } from "@/store/user/useUserStore";

const MAX_TO_RENDER_PER_BATCH = 20;
const WINDOW_SIZE = 20;
const INITIAL_NUM_TO_RENDER = 20;
const PADDING_BOTTOM = 70;

export interface ICallLogListProps {
  callLogs: ICallLog[];
  callLogsError?: Error | null;
  isCallLogsLoading?: boolean;
  refetchCallLogs?: () => void;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}

export default function CallHistoryPanel({
  callLogs = [],
  callLogsError,
  isCallLogsLoading,
  refetchCallLogs,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: ICallLogListProps) {
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const insets = useSafeAreaInsets();
  const renderItem = useCallback(
    ({ item }: { item: ICallLog }) => {
      const direction =
        String(item.initiator?.id) === String(currentUserId)
          ? CallDirection.outgoing
          : CallDirection.incoming;
      const missed = item.status === CallStatus.MISSED || item.status === CallStatus.REJECTED;

      return <CallLogItem callLog={item} direction={direction} missed={missed} />;
    },
    [currentUserId]
  );

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4">
          <ActivityIndicator />
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage]);

  const renderEmptyComponent = useCallback(() => {
    if (isCallLogsLoading) {
      return <ActivityIndicator className="my-6" />;
    }
    if (callLogsError) {
      return <Alert type="error" message={callLogsError.message} />;
    }
    return (
      <View className="flex-1 items-center justify-center p-4">
        <Text className="text-gray-500 dark:text-text-secondary-dark">No conversations yet</Text>
      </View>
    );
  }, [isCallLogsLoading, callLogsError]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage && fetchNextPage) {
      fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <FlatList
      data={callLogs}
      renderItem={renderItem}
      keyExtractor={(item) => item.callLogId.toString()}
      ListEmptyComponent={renderEmptyComponent}
      ListFooterComponent={renderFooter}
      showsVerticalScrollIndicator={false}
      maxToRenderPerBatch={MAX_TO_RENDER_PER_BATCH}
      windowSize={WINDOW_SIZE}
      initialNumToRender={INITIAL_NUM_TO_RENDER}
      refreshing={isCallLogsLoading}
      onRefresh={refetchCallLogs}
      keyboardShouldPersistTaps="handled"
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.1}
      contentContainerStyle={
        PLATFORM.IS_IOS && {
          paddingBottom: PADDING_BOTTOM + insets.bottom,
        }
      }
      ItemSeparatorComponent={() => <View className="h-1" />}
    />
  );
}
