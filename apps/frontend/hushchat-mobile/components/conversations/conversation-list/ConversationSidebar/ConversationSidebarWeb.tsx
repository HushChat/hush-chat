import { useCallback, useState } from "react";
import { Dimensions, View } from "react-native";
import { router } from "expo-router";
import { ConversationType, IConversation } from "@/types/chat/types";
import { CONVERSATION } from "@/constants/routes";
import { getConversationFilters } from "@/constants/conversationFilters";
import { useConversationList } from "@/hooks/useConversationList";
import { useConversationSearch } from "@/hooks/useConversationSearch";
import { usePublishUserActivity } from "@/hooks/usePublishUserActivity";
import { useConversationNavigation } from "@/contexts/ConversationNavigationContext";
import ConversationListContainer from "@/components/conversations/conversation-list/ConversationListContainer";
import { ConversationHeader } from "@/components/conversations/ConversationHeader";
import SearchBar from "@/components/SearchBar";
import FilterButton from "@/components/FilterButton";
import { WebGroupCreation } from "@/components/conversations/conversation-list/group-conversation-creation/web/WebGroupCreation";
import MentionedMessageListView from "@/components/conversations/conversation-list/MentionedMessageListView";
import { MotionView } from "@/motion/MotionView";
import { MotionEasing } from "@/motion/easing";

export default function ConversationSidebarWeb() {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMentionedMessages, setShowMentionedMessages] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(470);

  const screenWidth = Dimensions.get("window").width;
  const { jumpToMessage } = useConversationNavigation();

  const {
    selectedConversationType,
    setSelectedConversationType,
    selectedConversationId,
    conversations,
    selectedConversation,
    isLoadingConversations,
    conversationsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useConversationList();

  const {
    searchInput,
    searchResults,
    isSearching,
    searchError,
    refetchSearch,
    handleSearchInputChange,
    handleSearchClear,
  } = useConversationSearch();

  const filters = getConversationFilters(selectedConversationType);

  const handleSelectConversation = useCallback((conversation: IConversation | null) => {
    if (!conversation) return;
    router.push(CONVERSATION(conversation.id));
  }, []);

  const handleSearchMessageClick = useCallback(
    (conversationId: number, messageId: number) => {
      router.push(CONVERSATION(conversationId));
      jumpToMessage(messageId);
    },
    [jumpToMessage]
  );

  const handleMentionedMessageClick = useCallback(
    (message: any) => {
      if (message?.conversationId && message?.id) {
        router.push(CONVERSATION(message.conversationId));
        jumpToMessage(message.id);
      }
    },
    [jumpToMessage]
  );

  usePublishUserActivity({
    conversations,
    selectedConversationId,
  });

  return (
    <View
      onLayout={(event) => setLeftPaneWidth(Math.round(event.nativeEvent.layout.width))}
      className="w-[470px] min-w-72 max-w-2xl lg:w-[460px] bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 h-full"
    >
      <ConversationHeader
        selectedConversationType={selectedConversationType}
        setSelectedConversationType={setSelectedConversationType}
        onRefresh={refetch}
        isLoading={isLoadingConversations}
        onCreateGroup={() => setShowCreateGroup(true)}
        onOpenMentionedMessages={() => setShowMentionedMessages(true)}
      />

      {selectedConversationType === ConversationType.ALL && (
        <View className="px-4 sm:px-6">
          <SearchBar
            value={searchInput}
            onChangeText={handleSearchInputChange}
            onClear={handleSearchClear}
          />
        </View>
      )}

      {selectedConversationType !== ConversationType.ARCHIVED && (
        <View className="px-4 sm:px-6 py-3">
          <View className="flex-row flex-wrap gap-2">
            {filters.map((filter) => (
              <FilterButton
                key={filter.key}
                label={filter.label}
                isActive={filter.isActive}
                onPress={() => setSelectedConversationType(filter.key)}
              />
            ))}
          </View>
        </View>
      )}

      <View style={{ flex: 1, minHeight: 0 }}>
        <ConversationListContainer
          conversations={conversations}
          conversationsError={conversationsError?.message}
          conversationsLoading={isLoadingConversations}
          fetchNextPage={fetchNextPage}
          hasNextPage={hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
          conversationsRefetch={refetch}
          setSelectedConversation={handleSelectConversation}
          selectedConversation={selectedConversation}
          searchedConversationsResult={searchResults}
          isSearchingConversations={isSearching}
          errorWhileSearchingConversation={searchError?.message}
          searchQuery={searchInput}
          refetchSearchResults={refetchSearch}
          onMessageClick={handleSearchMessageClick}
        />
      </View>

      {showCreateGroup && (
        <WebGroupCreation
          visible={showCreateGroup}
          width={leftPaneWidth}
          onClose={() => setShowCreateGroup(false)}
          onCreate={() => {
            void refetch();
            setShowCreateGroup(false);
          }}
          setSelectedConversation={handleSelectConversation}
        />
      )}

      {showMentionedMessages && (
        <MotionView
          visible
          className="flex-1 absolute top-0 bottom-0 left-0 right-0 dark:!bg-secondary"
          delay={40}
          from={{ opacity: 0, translateX: screenWidth }}
          to={{ opacity: 1, translateX: 0 }}
          duration={{ enter: 240, exit: 200 }}
          easing={MotionEasing.pair}
        >
          <MentionedMessageListView
            onClose={() => setShowMentionedMessages(false)}
            onMessageClicked={handleMentionedMessageClick}
            setSelectedConversation={handleSelectConversation}
          />
        </MotionView>
      )}
    </View>
  );
}
