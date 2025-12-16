import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from "react-native";
import { IMentionedMessage } from "@/types/chat/types";
import { useGetAllMentionedMessages } from "@/query/useGetAllMentionedMessages";
import { PaginatedResponse } from "@/types/common/types";
import { MotionEasing } from "@/motion/easing";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { MotionView } from "@/motion/MotionView";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type TMentionedMessagesOverlay = {
  visible: boolean;
  width: number;
  onClose: () => void;
};

export default function MentionedMessageListView({
  visible,
  width,
  onClose,
}: TMentionedMessagesOverlay) {
  const {
    mentionedMessagePages,
    isLoadingMentionedMessages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetAllMentionedMessages();

  const pages =
    (mentionedMessagePages as { pages?: PaginatedResponse<IMentionedMessage>[] })?.pages ?? [];
  const favoriteMessages = pages.flatMap((page) => page?.content ?? []);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  if (isLoadingMentionedMessages) {
    return (
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark items-center justify-center">
        <ActivityIndicator size="large" />
      </SafeAreaView>
    );
  }

  const render = ({ item }: { item: IMentionedMessage }) => {
    return (
      <View className="flex-row ml-3">
        <AppText>{item.id}</AppText>
      </View>
    );
  };

  return (
    <MotionView
      visible={visible}
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.overlay, { width }]}
      className="dark:bg-gray-900"
      delay={40}
      from={{ opacity: 0, translateX: width }}
      to={{ opacity: 1, translateX: 0 }}
      duration={{ enter: 240, exit: 200 }}
      easing={MotionEasing.pair}
    >
      <View className="flex-row items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={() => onClose()} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#6B7280" />
          </TouchableOpacity>

          <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
            Mentioned Messages
          </AppText>
        </View>
      </View>

      <View className="w-[470px] min-w-72 max-w-2xl lg:w-[460px] bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 h-full">
        <FlatList
          data={favoriteMessages}
          renderItem={render}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            !isFetchingNextPage ? (
              <View className="flex-1 items-center justify-center pt-10">
                <AppText>No mentioned message yet.</AppText>
              </View>
            ) : null
          }
          onEndReached={handleLoadMore}
        />
      </View>
    </MotionView>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: "#FFFFFF",
  },
});
