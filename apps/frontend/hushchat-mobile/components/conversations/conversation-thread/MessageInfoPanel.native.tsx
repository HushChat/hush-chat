import { useGetAllMessageSeenParticipantsQuery } from "@/query/useGetAllMessageSeenParticipantsQuery";
import { TUser } from "@/types/user/types";
import { ActivityIndicator, FlatList, View } from "react-native";
import InitialsAvatar from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import BackButton from "@/components/BackButton";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Image } from "expo-image";

interface MessageInfoProps {
  conversationId: number;
  messageId: number;
}

const SIZE = 40;

export default function MessageInfoPanel({ conversationId, messageId }: MessageInfoProps) {
  const router = useRouter();

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
      {!item.signedImageUrl ? (
        <Image
          source={{ uri: item.signedImageUrl }}
          style={{ width: SIZE, height: SIZE, borderRadius: SIZE / 2 }}
          className="bg-gray-200"
          contentFit="cover"
          transition={200}
          cachePolicy="memory-disk"
        />
      ) : (
        <InitialsAvatar name={`${item.firstName ?? ""} ${item.lastName}`} size="md" />
      )}

      <View className="ml-3 flex-1">
        <AppText className="text-2xl font-medium text-gray-900 dark:text-gray-100">
          {item.firstName} {item.lastName}
        </AppText>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="p-3 border-b border-gray-200 dark:border-gray-700">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <BackButton onPress={() => router.back()} />
            <AppText className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
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
    </SafeAreaView>
  );
}
