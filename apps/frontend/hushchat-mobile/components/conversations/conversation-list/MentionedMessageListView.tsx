import { ActivityIndicator, FlatList, TouchableOpacity, View } from "react-native";
import { IConversation, IMentionedMessage, IMessage } from "@/types/chat/types";
import { useGetAllMentionedMessages } from "@/query/useGetAllMentionedMessages";
import { AppText } from "@/components/AppText";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import { formatDateTime } from "@/utils/commonUtils";
import BackButton from "@/components/BackButton";
import { PLATFORM } from "@/constants/platformConstants";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { CHAT_VIEW_PATH } from "@/constants/routes";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import FormattedText from "@/components/FormattedText";

type TMentionedMessagesOverlay = {
  onClose?: () => void;
  onMessageClicked?: (message: any) => void;
  setSelectedConversation?: (conversation: IConversation | null) => void;
};

export default function MentionedMessageListView({
  onClose,
  onMessageClicked,
  setSelectedConversation,
}: TMentionedMessagesOverlay) {
  const router = useRouter();

  const isMobileLayout = useIsMobileLayout();

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

  const handleMessagePress = useCallback(
    (message: IMessage, conversation: IConversation) => {
      if (isMobileLayout) {
        router.push({
          pathname: CHAT_VIEW_PATH,
          params: {
            conversationId: conversation.id,
            messageId: message.id,
          },
        });
      } else {
        if (setSelectedConversation) {
          setSelectedConversation(conversation);
        }
        onMessageClicked?.(message);
      }
    },
    [isMobileLayout, onMessageClicked]
  );

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

  const render = useCallback(({ item }: { item: IMentionedMessage }) => {
    const senderName = item.message.senderFirstName + " " + item.message.senderLastName;

    return (
      <TouchableOpacity
        onPress={() => handleMessagePress(item.message, item.conversation)}
        className="flex-col ml-3 justify-center mb-4 p-1 group"
      >
        <View className="flex-row items-center gap-x-2">
          <AppText className="font-bold text-base group-hover:text-[#6B4EFF]">
            {item.conversation.name}
          </AppText>
          <AppText className="text-gray-500 dark:text-gray-400">
            {formatDateTime(item.message.createdAt)}
          </AppText>
        </View>
        <AppText className="text-gray-500 dark:text-gray-400">
          <AppText className="font-bold text-base group-hover:text-[#6B4EFF]">{senderName}</AppText>
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
        <View className="h-[1px] bg-gray-200 dark:bg-gray-700 group-hover:bg-[#6B4EFF] w-[90%] self-center mt-3" />
      </TouchableOpacity>
    );
  }, []);

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
          showsVerticalScrollIndicator={PLATFORM.IS_WEB}
        />
      </View>
    </View>
  );
}
