import { useGetAllMessageSeenParticipantsQuery } from "@/query/useGetAllMessageSeenParticipantsQuery";
import { PaginatedResponse } from "@/types/common/types";
import { TUser } from "@/types/user/types";
import { FlatList, Image, View } from "react-native";
import InitialsAvatar from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import BackButton from "@/components/BackButton";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";

interface MessageInfoProps {
  conversationId: number;
  messageId: number;
}

export default function MessageInfoPanel({ conversationId, messageId }: MessageInfoProps) {
  const router = useRouter();

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
        ListEmptyComponent={
          !isFetchingNextPage ? (
            <View className="flex-1 items-center justify-center pt-10">
              <AppText>No one has seen this message yet.</AppText>
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
      />
    </SafeAreaView>
  );
}
