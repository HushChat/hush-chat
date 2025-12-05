import { AppText } from "@/components/AppText";
import { FlatList, View } from "react-native";
import BackButton from "@/components/BackButton";
import { useRouter } from "expo-router";
import { useGetAllConversationFavoriteMessagesQuery } from "@/query/useGetAllConversationFavoriteMessagesQuery";
import { PaginatedResponse } from "@/types/common/types";
import { IMessage } from "@/types/chat/types";
import { PLATFORM } from "@/constants/platformConstants";
import React from "react";
import { useUserStore } from "@/store/user/useUserStore";
import MessageContentBlock from "../conversation-thread/MessageContentBlock";

interface IFavoriteMessagesProps {
  conversationId: number | string;
  onClose?: () => void;
}

export default function FavoriteMessages({ conversationId, onClose }: IFavoriteMessagesProps) {
  const {
    user: { id: currentUserId },
  } = useUserStore();
  const router = useRouter();

  const { favoriteMessagePages, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useGetAllConversationFavoriteMessagesQuery(Number(conversationId));

  const pages = (favoriteMessagePages as { pages?: PaginatedResponse<IMessage>[] })?.pages ?? [];
  const favoriteMessages = pages.flatMap((page) => page?.content ?? []);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  };

  const render = ({ item }: { item: IMessage }) => {
    return (
      <MessageContentBlock
        message={item}
        isCurrentUser={true}
        currentUserId={String(currentUserId)}
        showSenderAvatar={true}
        selected={false}
        selectionMode={false}
        showHeader={false}
      />
    );
  };

  // const renderFavoriteMessage = ({ item }: { item: IMessage }) => {
  //   const dateObject = parseISO(item.createdAt);
  //   const dateTitle = getDateTitle(dateObject);
  //
  //   const isCurrentUser = item.senderId === currentUserId;
  //   const hasText = !!item.messageText;
  //
  //   return (
  //     <View className="flex-col ml-1 py-3">
  //       <View className="flex-1 flex-row justify-between">
  //         <View className="flex-row items-center gap-x-2">
  //           <View>
  //             {item.senderSignedImageUrl ? (
  //               <Image
  //                 source={{ uri: item.senderSignedImageUrl }}
  //                 className="w-8 h-8 rounded-full bg-gray-200"
  //               />
  //             ) : (
  //               <InitialsAvatar
  //                 name={`${item.senderFirstName} ${item.senderLastName}`}
  //                 size="esm"
  //               />
  //             )}
  //           </View>
  //           <View>
  //             <AppText className="text-sm font-medium text-gray-900 dark:text-gray-100">
  //               {isCurrentUser ? "You" : `${item.senderFirstName} ${item.senderLastName}`}
  //             </AppText>
  //           </View>
  //         </View>
  //
  //         <View>
  //           <AppText className="text-sm font-medium text-gray-900 dark:text-gray-100">
  //             {dateTitle}
  //           </AppText>
  //         </View>
  //       </View>
  //
  //       <View>
  //         {item.messageText}
  //         {/*<MessageBubble*/}
  //         {/*  message={item}*/}
  //         {/*  isCurrentUser={item.senderId === currentUserId}*/}
  //         {/*  hasText={hasText}*/}
  //         {/*  hasAttachments={item.hasAttachment}*/}
  //         {/*  hasImages={hasImages()}*/}
  //         {/*  selected={selected}*/}
  //         {/*  selectionMode={selectionMode}*/}
  //         {/*  isForwardedMessage={isForwardedMessage}*/}
  //         {/*  attachments={attachments}*/}
  //         {/*  onBubblePress={handleBubblePress}*/}
  //         {/*/>*/}
  //       </View>
  //     </View>
  //   );
  // };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="p-3">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <BackButton
              onPress={() => {
                if (PLATFORM.IS_WEB) {
                  onClose?.();
                } else {
                  router.back();
                }
              }}
            />
            <AppText className="text-lg font-semibold text-gray-900 dark:text-white ml-2">
              Favorite Messages {favoriteMessages?.[0]?.isFavorite}
            </AppText>
          </View>
        </View>
      </View>

      <FlatList
        data={favoriteMessages}
        renderItem={render}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          !isFetchingNextPage ? (
            <View className="flex-1 items-center justify-center pt-10">
              <AppText>No favorite message yet.</AppText>
            </View>
          ) : null
        }
        onEndReached={handleLoadMore}
      />
    </View>
  );
}
