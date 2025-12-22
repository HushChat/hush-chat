import { ConversationType, IConversation } from "@/types/chat/types";
import { useCallback } from "react";
import { ActivityIndicator, View } from "react-native";
import ConversationListNavItem from "@/components/conversations/conversation-list/common/ConversationListNavItem";
import Alert from "@/components/Alert";
import ConversationListItem from "@/components/conversations/conversation-list/ConversationListItem";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { handleChatPress } from "@/utils/commonUtils";
import BaseConversationList from "./BaseConversationList";
import { AppText, AppTextInput } from "@/components/AppText";

export interface RegularConversationListViewProps {
  conversations: IConversation[];
  conversationsError?: string;
  conversationsLoading: boolean;
  conversationsRefetch: () => void;
  setSelectedConversation: (conversation: IConversation | null) => void;
  fetchNextPage: () => Promise<unknown>;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  selectedConversation: IConversation | null;
  onArchive: (conversationId: number) => Promise<void>;
  onDelete: (conversationId: number) => void;
}

export default function RegularConversationListView({
  conversations = [],
  conversationsError,
  conversationsLoading,
  conversationsRefetch,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
  selectedConversation,
  setSelectedConversation,
  onArchive,
  onDelete,
}: RegularConversationListViewProps) {
  const { selectedConversationType, setSelectedConversationType } = useConversationStore();

  const renderHeader = useCallback(() => {
    if (selectedConversationType === ConversationType.ARCHIVED) {
      return (
        <View className="px-4 py-3 bg-background-secondary-light dark:bg-background-primary-dark">
          <AppTextInput className="text-sm text-text-secondary-light dark:text-text-secondary-dark text-center py-3">
            These chats stay archived when new messages are received.
          </AppTextInput>
        </View>
      );
    }

    return (
      <ConversationListNavItem
        title={"Archived"}
        iconName={"archive-outline"}
        action={() => {
          setSelectedConversationType(ConversationType.ARCHIVED);
        }}
      />
    );
  }, [setSelectedConversationType, selectedConversationType]);

  const renderFooter = useCallback(() => {
    if (isFetchingNextPage) {
      return (
        <View className="py-4">
          <ActivityIndicator />
        </View>
      );
    }
    return null;
  }, [isFetchingNextPage]);

  const handleEndReached = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) {
      void fetchNextPage();
    }
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const renderEmptyComponent = useCallback(() => {
    if (conversationsLoading) {
      return <ActivityIndicator className="my-6" />;
    }
    if (conversationsError) {
      return <Alert type="error" message={conversationsError} />;
    }
    return (
      <View className="flex-1 items-center justify-center p-4">
        <AppText className="text-gray-500 dark:text-text-secondary-dark">
          No conversations yet
        </AppText>
      </View>
    );
  }, [conversationsLoading, conversationsError]);

  const renderItem = useCallback(
    ({ item }: { item: IConversation }) => {
      if (!item.messages || item.messages.length === 0) {
        return null;
      }

      return (
        <ConversationListItem
          conversation={item}
          handleChatPress={() => handleChatPress(setSelectedConversation)(item)}
          isConversationSelected={selectedConversation?.id === item?.id}
          handleArchivePress={onArchive}
          handleDeletePress={onDelete}
          conversationsRefetch={conversationsRefetch}
        />
      );
    },
    [selectedConversation?.id, onArchive, onDelete, conversationsRefetch, setSelectedConversation]
  );

  return (
    <BaseConversationList
      data={conversations}
      renderItem={renderItem}
      keyExtractor={(item) => item?.id.toString()}
      ListHeaderComponent={
        selectedConversationType === ConversationType.ALL ? renderHeader() : null
      }
      ListEmptyComponent={renderEmptyComponent()}
      ListFooterComponent={renderFooter()}
      onRefresh={conversationsRefetch}
      refreshing={conversationsLoading}
      onEndReached={handleEndReached}
      onArchive={onArchive}
    />
  );
}
