import React, { useMemo, useState } from "react";
import { View, ActivityIndicator, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { useGetMessageThreadQuery } from "@/query/useGetMessageThreadQuery";
import Alert from "@/components/Alert";
import ConversationMessageList from "@/components/conversations/conversation-thread/message-list/ConversationMessageList";
import { ConversationAPIResponse, TPickerState } from "@/types/chat/types";

interface MessageThreadScreenProps {
  messageId: number;
  conversationId: number;
  conversationAPIResponse: ConversationAPIResponse;
  onBack: () => void;
}

const MessageThreadScreen = ({
  messageId,
  conversationId,
  conversationAPIResponse,
  onBack,
}: MessageThreadScreenProps) => {
  const { isDark } = useAppTheme();
  const {
    messageThreadAPIResponse,
    messageThreadAPILoading,
    messageThreadAPIError,
    refetchMessageThread,
  } = useGetMessageThreadQuery(messageId);

  const [openPickerMessageId, setOpenPickerMessageId] = useState<string | null>(null);

  const threadMessages = useMemo(
    () => messageThreadAPIResponse?.data || [],
    [messageThreadAPIResponse]
  );
  const replyCount = useMemo(() => Math.max(0, threadMessages.length - 1), [threadMessages.length]);

  const pickerState: TPickerState = useMemo(
    () => ({
      openPickerMessageId,
      setOpenPickerMessageId,
    }),
    [openPickerMessageId]
  );

  if (messageThreadAPILoading) {
    return (
      <View className="flex-1">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      </View>
    );
  }

  if (messageThreadAPIError) {
    return (
      <View className="flex-1 p-4">
        <TouchableOpacity onPress={onBack} className="mb-4">
          <Ionicons name="arrow-back" size={24} color={isDark ? "#FFFFFF" : "#000000"} />
        </TouchableOpacity>
        <Alert type="error" message={messageThreadAPIError?.message || "Failed to load thread"} />
      </View>
    );
  }

  return (
    <View className="flex-1">
      <View className="flex-row items-center px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
        <TouchableOpacity
          onPress={onBack}
          className="mr-3 p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={isDark ? "#60A5FA" : "#3B82F6"} />
        </TouchableOpacity>

        <View className="flex-1">
          <Text className="text-sm font-semibold text-blue-600 dark:text-blue-400">
            Thread • {replyCount} {replyCount === 1 ? "reply" : "replies"}
          </Text>
        </View>

        <TouchableOpacity
          onPress={refetchMessageThread}
          disabled={messageThreadAPILoading}
          className="p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          {messageThreadAPILoading ? (
            <ActivityIndicator size="small" color={isDark ? "#60A5FA" : "#3B82F6"} />
          ) : (
            <Ionicons name="refresh" size={20} color={isDark ? "#60A5FA" : "#3B82F6"} />
          )}
        </TouchableOpacity>
      </View>

      {threadMessages.length > 0 ? (
        <ConversationMessageList
          messages={threadMessages}
          onLoadMore={() => {}}
          onLoadNewer={() => {}}
          hasMoreNewer={false}
          isFetchingNewer={false}
          isFetchingNextPage={false}
          conversationAPIResponse={conversationAPIResponse}
          pickerState={pickerState}
          selectedConversationId={conversationId}
          isThreadView={true}
        />
      ) : (
        <View className="flex-1 items-center justify-center p-4">
          <Alert type="info" message="No messages in this thread" />
        </View>
      )}
    </View>
  );
};

export default MessageThreadScreen;
