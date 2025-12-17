import { ActivityIndicator, FlatList, View } from "react-native";
import { IMentionedMessage } from "@/types/chat/types";
import { useGetAllMentionedMessages } from "@/query/useGetAllMentionedMessages";
import { AppText } from "@/components/AppText";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import FormattedText from "@/components/FormattedText";
import { formatDateTime } from "@/utils/commonUtils";
import BackButton from "@/components/BackButton";
import { PLATFORM } from "@/constants/platformConstants";
import { useRouter } from "expo-router";

type TMentionedMessagesOverlay = {
  onClose?: () => void;
};

export default function MentionedMessageListView({ onClose }: TMentionedMessagesOverlay) {
  const router = useRouter();

  const {
    mentionedMessages,
    isLoadingMentionedMessages,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useGetAllMentionedMessages();

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const renderEmptyComponent = () => {
    if (isLoadingMentionedMessages) {
      return (
        <View className="py-12 items-center justify-center">
          <ActivityIndicator size="large" color="#6B7280" />
        </View>
      );
    }

    return (
      <View className="flex-1 items-center justify-center pt-10">
        <AppText>No one has mentioned you yet!</AppText>
      </View>
    );
  };

  const render = ({ item }: { item: IMentionedMessage }) => {
    const senderName = item.message.senderFirstName + " " + item.message.senderLastName;

    return (
      <View className="flex-col ml-3 justify-center mb-4 p-1">
        <View className="flex-row items-center gap-x-2">
          <AppText className="font-bold">{item.conversation.name}</AppText>
          <AppText>{formatDateTime(item.message.createdAt)}</AppText>
        </View>
        <AppText>
          <AppText className="font-bold">{senderName}</AppText>
          {" mentioned you"}
        </AppText>
        <View className="flex-row gap-x-2">
          {item.message.senderSignedImageUrl ? (
            <View className="mr-2 pt-1 w-10 h-10">
              <InitialsAvatar
                name={senderName}
                size={AvatarSize.extraSmall}
                imageUrl={item.message.senderSignedImageUrl}
              />
            </View>
          ) : (
            <InitialsAvatar name={senderName} size={AvatarSize.extraSmall} />
          )}
          <View className="flex-1 pr-2">
            <FormattedText
              text={item.message.messageText}
              mentions={[item.mentionedUser]}
              isCurrentUser={false}
            />
          </View>
        </View>
        <View className="h-[1px] bg-gray-200 dark:bg-gray-700 w-[90%] self-center mt-3" />
      </View>
    );
  };

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center">
          <BackButton
            onPress={() => {
              if (PLATFORM.IS_WEB) {
                onClose?.();
              } else {
                router.back();
              }
            }}
          />

          <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
            Mentioned Messages
          </AppText>
        </View>
      </View>

      <View className="bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 h-full">
        <FlatList
          data={mentionedMessages}
          renderItem={render}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 50 }}
          ListEmptyComponent={renderEmptyComponent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      </View>
    </View>
  );
}
