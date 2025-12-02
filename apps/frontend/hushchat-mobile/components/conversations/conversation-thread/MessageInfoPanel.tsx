import { View, Image, FlatList } from "react-native";
import React from "react";
import BackButton from "@/components/BackButton";
import { MotionView } from "@/motion/MotionView";
import { useGetAllMessageSeenParticipantsQuery } from "@/query/useGetAllMessageSeenParticipantsQuery";
import { PaginatedResponse } from "@/types/common/types";
import { TUser } from "@/types/user/types";
import { AppText } from "@/components/AppText";
import InitialsAvatar from "@/components/InitialsAvatar";

interface MessageInfoProps {
  conversationId: number;
  messageId: number;
  onClose?: () => void;
  visible: boolean;
  panelWidth?: number;
}

export default function MessageInfoPanel({
  conversationId,
  messageId,
  onClose = () => {},
  visible,
  panelWidth,
}: MessageInfoProps) {
  const { messageSeenParticipantPages, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useGetAllMessageSeenParticipantsQuery(conversationId, messageId);

  const pages =
    (messageSeenParticipantPages as { pages?: PaginatedResponse<TUser>[] })?.pages ?? [];
  const messageSeenParticipants = pages.flatMap((page) => page?.content ?? []);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const renderParticipant = ({ item }: { item: TUser }) => (
    <View className="flex-row items-center px-4 py-3">
      {item.signedImageUrl ? (
        <Image
          source={{ uri: item.signedImageUrl }}
          className="w-10 h-10 rounded-full bg-gray-200"
        />
      ) : (
        <InitialsAvatar name={`${item.firstName ?? ""}`} size="lg" />
      )}

      <View className="ml-3 flex-1">
        <AppText className="text-base font-medium text-gray-900 dark:text-gray-100">
          {item.firstName} {item.lastName}
        </AppText>
      </View>
    </View>
  );

  return (
    <MotionView
      visible={visible}
      className="flex-1 absolute top-0 bottom-0 left-0 right-0 dark:!bg-secondary-dark"
      from={{ translateX: panelWidth, opacity: 0 }}
      to={{ translateX: 0, opacity: 1 }}
    >
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <View className="p-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <BackButton onPress={onClose} />
              <AppText className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
                Read By
              </AppText>
            </View>
          </View>
        </View>

        <FlatList
          data={messageSeenParticipants}
          renderItem={renderParticipant}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            !isFetchingNextPage ? (
              <View className="flex-1 items-center justify-center pt-10">
                <AppText>No one has seen this message yet.</AppText>
              </View>
            ) : null
          }
          onEndReached={handleLoadMore}
        />
      </View>
    </MotionView>
  );
}
