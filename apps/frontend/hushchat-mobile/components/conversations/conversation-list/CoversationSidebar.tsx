import ConversationListContainer from "@/components/conversations/conversation-list/ConversationListContainer";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import useGlobalSearchQuery from "@/query/useGlobalSearchQuery";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { IConversation, IFilter, ConversationType } from "@/types/chat/types";
import { getCriteria } from "@/utils/conversationUtils";
import { debounce } from "lodash";
import { useCallback, useEffect, useMemo, useState } from "react";
import { router, useGlobalSearchParams } from "expo-router";
import { PLATFORM } from "@/constants/platformConstants";
import { CONVERSATION } from "@/constants/routes";
import { getAllTokens } from "@/utils/authUtils";
import { UserActivityWSSubscriptionData } from "@/types/ws/types";
import { useUserStore } from "@/store/user/useUserStore";
import { useWebSocket } from "@/contexts/WebSocketContext";
import { WebGroupCreation } from "@/components/conversations/conversation-list/group-conversation-creation/web/WebGroupCreation";
import { MotionView } from "@/motion/MotionView";
import { MotionEasing } from "@/motion/easing";
import MentionedMessageListView from "@/components/conversations/conversation-list/MentionedMessageListView";
import { Dimensions, View } from "react-native";
import { ConversationHeader } from "@/components/conversations/ConversationHeader";
import SearchBar from "@/components/SearchBar";
import FilterButton from "@/components/FilterButton";

export default function ConversationSidebar() {
  const { selectedConversationType, setSelectedConversationType } = useConversationStore();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showMentionedMessages, setShowMentionedMessages] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [screenWidth, setScreenWidth] = useState<number>(Dimensions.get("window").width);

  const {
    user: { email },
  } = useUserStore();

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const { id } = useGlobalSearchParams<{ id?: string }>();
  const selectedConversationId = id ? Number(id) : null;
  const [leftPaneWidth, setLeftPaneWidth] = useState(470);

  const criteria = useMemo(() => getCriteria(selectedConversationType), [selectedConversationType]);

  const debouncedSearchQuery = useMemo(
    () =>
      debounce((value: string) => {
        setSearchQuery(value);
      }, 500),
    []
  );

  useEffect(() => {
    return () => {
      debouncedSearchQuery.cancel();
    };
  }, [debouncedSearchQuery]);

  const {
    conversationsPages,
    isLoadingConversations,
    conversationsError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useConversationsQuery(criteria);

  const conversations = conversationsPages?.pages.flatMap((page) => page.content) ?? [];

  const { searchResults, isSearching, searchError, refetchSearch } =
    useGlobalSearchQuery(searchQuery);

  const { publishActivity } = useWebSocket();

  useEffect(() => {
    const publishUserActivity = async () => {
      const { workspace } = await getAllTokens();
      const conversationIds = conversations.map((c) => c.id);

      await publishActivity({
        workspaceId: workspace as string,
        email,
        visibleConversations: conversationIds,
        openedConversation: selectedConversationId ?? undefined,
      } as UserActivityWSSubscriptionData);
    };

    if (conversations.length) {
      void publishUserActivity();
    }
  }, [conversations, selectedConversationId, email, publishActivity]);

  const handleSetSelectedConversation = useCallback((conversation: IConversation | null) => {
    if (!conversation) return;

    if (PLATFORM.IS_WEB) {
      router.push(CONVERSATION(conversation.id));
    }
  }, []);

  const handleSearchMessageClick = useCallback((message: any) => {
    if (message?.conversationId) {
      router.push(CONVERSATION(message.conversationId));
    }
  }, []);

  const handleSearchInputChange = useCallback(
    (value: string) => {
      setSearchInput(value);
      debouncedSearchQuery(value);
    },
    [debouncedSearchQuery]
  );

  const handleSearchClear = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
  }, []);

  const filters: IFilter[] = [
    {
      key: ConversationType.ALL,
      label: "All",
      isActive: selectedConversationType === ConversationType.ALL,
    },
    {
      key: ConversationType.FAVORITES,
      label: "Favorites",
      isActive: selectedConversationType === ConversationType.FAVORITES,
    },
    {
      key: ConversationType.GROUPS,
      label: "Groups",
      isActive: selectedConversationType === ConversationType.GROUPS,
    },
    {
      key: ConversationType.MUTED,
      label: "Muted",
      isActive: selectedConversationType === ConversationType.MUTED,
    },
  ];

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
            <View className="flex-row space-x-2">
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
          setSelectedConversation={handleSetSelectedConversation}
          selectedConversation={
            selectedConversationId
              ? (conversations.find((c) => c.id === selectedConversationId) ?? null)
              : null
          }
          searchedConversationsResult={searchResults}
          isSearchingConversations={isSearching}
          errorWhileSearchingConversation={searchError?.message}
          searchQuery={searchInput}
          refetchSearchResults={refetchSearch}
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
          setSelectedConversation={handleSetSelectedConversation}
        />
      )}

      {showMentionedMessages && (
        <MotionView
          visible={showMentionedMessages}
          className="flex-1 absolute top-0 bottom-0 left-0 right-0 dark:!bg-secondary"
          delay={40}
          from={{ opacity: 0, translateX: screenWidth }}
          to={{ opacity: 1, translateX: 0 }}
          duration={{ enter: 240, exit: 200 }}
          easing={MotionEasing.pair}
        >
          <MentionedMessageListView
            onClose={() => setShowMentionedMessages(false)}
            onMessageClicked={handleSearchMessageClick}
            setSelectedConversation={handleSetSelectedConversation}
          />
        </MotionView>
      )}
    </View>
  );
}
