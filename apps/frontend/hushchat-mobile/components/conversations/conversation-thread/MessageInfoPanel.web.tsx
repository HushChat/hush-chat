import { View, FlatList, ActivityIndicator } from "react-native";
import React from "react";
import BackButton from "@/components/BackButton";
import { MotionView } from "@/motion/MotionView";
import { useGetAllMessageSeenParticipantsQuery } from "@/query/useGetAllMessageSeenParticipantsQuery";
import { TUser } from "@/types/user/types";
import { AppText } from "@/components/AppText";
import InitialsAvatar from "@/components/InitialsAvatar";
import { Image } from "expo-image";

interface MessageInfoProps {
  conversationId: number;
  messageId: number;
  onClose?: () => void;
  visible: boolean;
  panelWidth?: number;
}

const SIZE = 40;

export default function MessageInfoPanel({
  conversationId,
  messageId,
  onClose = () => {},
  visible,
  panelWidth,
}: MessageInfoProps) {
  const {
    messageSeenParticipants,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    isLoadingMessageSeenParticipants,
  } = useGetAllMessageSeenParticipantsQuery(conversationId, messageId);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const renderEmptyComponent = () => {
    if (isLoadingMessageSeenParticipants) {
      return (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="large" color="#6B7280" />
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center pt-10">
        <AppText>No one has seen this message yet.</AppText>
      </View>
    );
  };

  const renderParticipant = ({ item }: { item: TUser }) => (
    <View className="flex-row items-center px-4 py-3">
      {item.signedImageUrl ? (
        <Image
          source={{ uri: item.signedImageUrl }}
          style={{ width: SIZE, height: SIZE, borderRadius: SIZE / 2 }}
          className="bg-gray-200"
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      ) : (
        <InitialsAvatar name={`${item.firstName ?? ""} ${item.lastName}`} size="sm" />
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
          ListEmptyComponent={renderEmptyComponent}
          onEndReached={handleLoadMore}
        />
      </View>
    </MotionView>
  );
}
