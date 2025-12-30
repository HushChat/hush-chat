import React from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import InitialsAvatar from "@/components/InitialsAvatar";
import { IMessage } from "@/types/chat/types";
import { MessageBubble } from "@/components/conversations/conversation-thread/message-list/MessageBubble";
import { useGetMessagesWithLinksQuery } from "@/query/useGetMessagesWithLinksQuery";
import { useUserStore } from "@/store/user/useUserStore";
import { formatRelativeDate } from "@/utils/messageUtils";

interface LinksListProps {
  conversationId: number;
  colors: {
    text: string;
    icon: string;
    tint: string;
    background: string;
  };
}

export default function LinksList({ conversationId, colors }: LinksListProps) {
  const { user } = useUserStore();
  const currentUserId = user?.id;

  const {
    pages: linksPages,
    isLoading,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetMessagesWithLinksQuery(conversationId, 20);

  const messages = React.useMemo(
    () => linksPages?.pages.flatMap((page) => (page.content || []) as IMessage[]) || [],
    [linksPages]
  );

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isNearBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isNearBottom && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center px-8">
        <ActivityIndicator size="large" color={colors.tint} />
        <AppText className="text-sm mt-3" style={{ color: colors.icon }}>
          Loading links...
        </AppText>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-8">
        <Ionicons name="alert-circle-outline" size={64} color={colors.icon} />
        <AppText className="text-base mt-4 text-center" style={{ color: colors.icon }}>
          Failed to load links
        </AppText>
      </View>
    );
  }

  if (messages.length === 0) {
    return (
      <View className="flex-1 justify-center items-center px-8">
        <Ionicons name="link-outline" size={64} color={colors.icon} />
        <AppText className="text-base mt-4 text-center" style={{ color: colors.icon }}>
          No links shared yet
        </AppText>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1"
      onScroll={handleScroll}
      scrollEventThrottle={400}
      style={{ backgroundColor: colors.background }}
    >
      <View className="px-4 pt-4 gap-3">
        {messages.map((message) => {
          const isCurrentUser = currentUserId && Number(currentUserId) === message?.senderId;
          const senderName = isCurrentUser
            ? "You"
            : `${message.senderFirstName} ${message.senderLastName}`;

          return (
            <View
              key={message.id}
              className="rounded-lg overflow-hidden bg-background-light dark:bg-background-dark"
            >
              <View className="flex-row items-center px-4 pt-4 pb-2">
                <InitialsAvatar
                  name={senderName}
                  imageUrl={message.senderSignedImageUrl}
                  size="esm"
                />
                <AppText className="text-sm font-medium ml-2 flex-1" style={{ color: "#3B82F6" }}>
                  {senderName}
                </AppText>
                <AppText className="text-xs" style={{ color: colors.icon }}>
                  {formatRelativeDate(message.createdAt)}
                </AppText>
              </View>

              <View className="px-4 pb-3">
                <MessageBubble
                  message={message}
                  isCurrentUser={false}
                  hasText={!!message.messageText}
                  hasAttachments={false}
                  hasMedia={false}
                  selected={false}
                  selectionMode={false}
                  isForwardedMessage={message.isForwarded}
                  attachments={[]}
                  onBubblePress={() => {}}
                />
              </View>
            </View>
          );
        })}
      </View>

      {isFetchingNextPage && (
        <View className="p-4 items-center">
          <ActivityIndicator size="small" color={colors.tint} />
        </View>
      )}

      <View className="h-4" />
    </ScrollView>
  );
}
