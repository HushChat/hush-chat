import { ActivityIndicator, Dimensions, FlatList, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { MotionView } from "@/motion/MotionView";
import React, { useCallback } from "react";
import { useGetAllCommonGroupsQuery } from "@/query/useGetAllCommonGroupsQuery";
import { IConversation } from "@/types/chat/types";
import InitialsAvatar from "@/components/InitialsAvatar";
import { Image } from "expo-image";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { useRouter } from "expo-router";
import { CHAT_VIEW_PATH } from "@/constants/routes";

const SIZE = 40;

interface ICommonGroupsViewProps {
  conversationId: number;
  onClose: () => void;
  visible: boolean;
  setSelectedConversation: (conversation: IConversation | null) => void;
}

export default function CommonGroupsView({
  conversationId,
  onClose,
  visible,
  setSelectedConversation,
}: ICommonGroupsViewProps) {
  const screenWidth = Dimensions.get("window").width;
  const isMobileLayout = useIsMobileLayout();
  const router = useRouter();

  const {
    commonGroupConversations,
    isLoadingCommonGroupConversations,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetAllCommonGroupsQuery(conversationId);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const handleCommonGroupPress = useCallback(
    (conversation: IConversation) => {
      if (isMobileLayout) {
        router.push({
          pathname: CHAT_VIEW_PATH,
          params: {
            conversationId: conversation.id,
          },
        });
      } else {
        if (setSelectedConversation) {
          setSelectedConversation(conversation);
        }
      }
    },
    [isMobileLayout, setSelectedConversation]
  );

  const renderEmptyComponent = () => {
    if (isLoadingCommonGroupConversations) {
      return (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="large" color="#6B7280" />
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center pt-10">
        <AppText>No common groups yet.</AppText>
      </View>
    );
  };

  const renderCommonGroups = ({ item }: { item: IConversation }) => (
    <TouchableOpacity
      onPress={() => handleCommonGroupPress(item)}
      className="flex-row items-center px-4 py-3"
    >
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
        <InitialsAvatar name={item.name} size="sm" />
      )}

      <View className="ml-3 flex-1">
        <AppText className="text-lg font-medium text-gray-900 dark:text-gray-100">
          {item.name}
        </AppText>
      </View>
    </TouchableOpacity>
  );

  return (
    <MotionView
      visible={visible}
      className="absolute top-0 bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark"
      from={{ translateX: screenWidth, opacity: 0 }}
      to={{ translateX: 0, opacity: 1 }}
    >
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onClose} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#6B7280" />
          </TouchableOpacity>
          <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
            Common Groups
          </AppText>
        </View>
      </View>

      <FlatList
        data={commonGroupConversations}
        renderItem={renderCommonGroups}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={renderEmptyComponent}
        onEndReached={handleLoadMore}
      />
    </MotionView>
  );
}
