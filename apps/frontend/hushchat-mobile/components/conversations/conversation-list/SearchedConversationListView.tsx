import {
  ConversationSearchResultKeys,
  IConversation,
  ISearchResults,
  ISectionedSearchResult,
} from "@/types/chat/types";
import { useCallback, useMemo } from "react";
import { View, ActivityIndicator, ListRenderItemInfo } from "react-native";
import Alert from "@/components/Alert";
import ConversationListItem from "@/components/conversations/conversation-list/ConversationListItem";
import { SearchedItem } from "@/components/conversations/conversation-thread/message-list/SearchedMessageItem";
import { getAPIErrorMsg, handleChatPress } from "@/utils/commonUtils";
import { useUserStore } from "@/store/user/useUserStore";
import BaseConversationList from "./BaseConversationList";
import UserListItem from "@/components/UserListItem";
import { TUser } from "@/types/user/types";
import { useCreateOneToOneConversationMutation } from "@/query/post/queries";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { ToastUtils } from "@/utils/toastUtils";
import { getCriteria } from "@/utils/conversationUtils";
import { AppText } from "@/components/AppText";

interface SearchedConversationListProps {
  searchedConversationsResult: ISearchResults;
  isSearchingConversations: boolean;
  errorWhileSearchingConversation?: string;
  searchQuery: string;
  selectedConversation: IConversation | null;
  setSelectedConversation: (conversation: IConversation | null) => void;
  onArchive: (conversationId: number) => Promise<void>;
  onDelete: (conversationId: number) => void;
  onRefresh: () => void;
  onMessageClick?: (conversationId: number, messageId: number) => void;
}

// Stable empty array reference to avoid unnecessary re-renders
const EMPTY_ARRAY: ISectionedSearchResult[] = [];

const SectionHeader: React.FC<{ title: string }> = ({ title }: { title: string }) => (
  <View className="bg-gray-100 dark:bg-gray-900 px-4 py-1.5 rounded-md">
    <AppText className="text-text-secondary-light dark:text-text-secondary-dark font-medium text-base capitalize">
      {title}
    </AppText>
  </View>
);

export default function SearchedConversationList({
  searchedConversationsResult,
  isSearchingConversations,
  errorWhileSearchingConversation,
  searchQuery,
  selectedConversation,
  setSelectedConversation,
  onArchive,
  onDelete,
  onRefresh,
  onMessageClick,
}: SearchedConversationListProps) {
  const { user } = useUserStore();
  const currentUserId = user?.id;
  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);
  const createConversation = useCreateOneToOneConversationMutation(
    { userId: currentUserId, criteria },
    (conversation) => {
      handleChatPress(setSelectedConversation)(conversation);
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const handleOpenOrCreateConversation = useCallback(
    (targetUser: TUser) => {
      if (!targetUser.conversationId) {
        createConversation.mutate(targetUser.id);
      } else {
        handleChatPress(setSelectedConversation)({
          id: targetUser.conversationId,
        } as IConversation);
      }
    },
    [createConversation, setSelectedConversation]
  );

  const preparedDataWithSections = useMemo<ISectionedSearchResult[]>(() => {
    const { chats = [], messages = [], users = [] } = searchedConversationsResult;

    // Early return with stable empty array
    if (!chats?.length && !messages?.length && !users?.length) {
      return EMPTY_ARRAY;
    }

    // Build sections array first to simplify the flatMap
    const sections: {
      key: ConversationSearchResultKeys;
      items: any[];
    }[] = [];

    if (users?.length > 0) {
      sections.push({ key: ConversationSearchResultKeys.USERS, items: users });
    }

    if (chats?.length > 0) {
      sections.push({ key: ConversationSearchResultKeys.CHATS, items: chats });
    }

    if (messages?.length > 0) {
      sections.push({
        key: ConversationSearchResultKeys.MESSAGES,
        items: messages,
      });
    }

    return sections.flatMap((section) => [
      // Header item
      {
        _isHeader: true,
        _headerTitle: section.key,
        _sectionType: section.key,
        _uniqueKey: `${section.key}-header`,
      } as unknown as ISectionedSearchResult,

      ...section.items.map(
        (item, index) =>
          ({
            ...item,
            _isHeader: false,
            _sectionType: section.key,
            _uniqueKey: `${section.key}-${item.id}-${index}`,
          }) as ISectionedSearchResult
      ),
    ]);
  }, [searchedConversationsResult]);

  const renderItem = useCallback(
    (rowData: ListRenderItemInfo<ISectionedSearchResult>) => {
      const item = rowData.item;

      if (!item) return null;

      if (item._isHeader && item._headerTitle) {
        return <SectionHeader title={item._headerTitle} />;
      }

      const { _sectionType } = item;

      if (_sectionType === ConversationSearchResultKeys.MESSAGES) {
        const conversation = item as unknown as IConversation;
        const firstMessage = conversation.messages?.[0];
        const isCurrentUser = firstMessage && Number(currentUserId) === firstMessage.senderId;

        return (
          <SearchedItem
            conversation={conversation}
            searchQuery={searchQuery}
            onConversationItemPress={(conv) => {
              if (firstMessage?.id) {
                onMessageClick?.(conv.id, firstMessage.id);
              }
            }}
            isCurrentUser={isCurrentUser}
          />
        );
      }

      if (_sectionType === ConversationSearchResultKeys.USERS) {
        const user = item as TUser;
        return (
          <UserListItem
            user={user}
            isSelected={false}
            onToggle={() => handleOpenOrCreateConversation(user)}
          />
        );
      }

      if (_sectionType === ConversationSearchResultKeys.CHATS) {
        const conversation = item as unknown as IConversation;
        return (
          <ConversationListItem
            conversation={conversation}
            handleChatPress={() => handleChatPress(setSelectedConversation)(conversation)}
            isConversationSelected={selectedConversation?.id === conversation.id}
            handleArchivePress={onArchive}
            handleDeletePress={onDelete}
            conversationsRefetch={onRefresh}
          />
        );
      }

      return null;
    },
    [
      currentUserId,
      searchQuery,
      setSelectedConversation,
      handleOpenOrCreateConversation,
      selectedConversation?.id,
      onArchive,
      onDelete,
      onRefresh,
      onMessageClick,
    ]
  );

  const renderEmptyComponent = useCallback(() => {
    if (isSearchingConversations) {
      return (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" />
          <AppText className="mt-2 text-gray-500">Searching...</AppText>
        </View>
      );
    }

    if (errorWhileSearchingConversation) {
      return <Alert type="error" message={errorWhileSearchingConversation} />;
    }

    return (
      <View className="flex-1 justify-center items-center px-8">
        <AppText className="text-center text-gray-500">
          No conversations, messages or users found for &quot;{searchQuery}
          &quot;
        </AppText>
      </View>
    );
  }, [isSearchingConversations, errorWhileSearchingConversation, searchQuery]);

  const ListEmptyComponent = useMemo(() => renderEmptyComponent(), [renderEmptyComponent]);

  return (
    <BaseConversationList<ISectionedSearchResult>
      data={preparedDataWithSections}
      renderItem={renderItem}
      keyExtractor={(item: ISectionedSearchResult) => item._uniqueKey || item._headerTitle || ""}
      ListEmptyComponent={ListEmptyComponent}
      onRefresh={onRefresh}
      refreshing={false}
      onArchive={onArchive}
      allowSwipe={true}
    />
  );
}
