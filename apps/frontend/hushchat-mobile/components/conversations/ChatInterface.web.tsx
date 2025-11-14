import { View, Dimensions, ScrollView } from "react-native";
import FilterButton from "@/components/FilterButton";
import { ChatComponentProps, ConversationType } from "@/types/chat/types";
import usePanelManager from "@/hooks/useWebPanelManager";
import { useCallback, useEffect, useState } from "react";
import ConversationThreadScreen from "@/app/conversation-threads";
import ConversationInfoPanel from "@/components/conversations/conversation-info-panel/ConversationInfoPanel";
import Placeholder from "@/components/Placeholder";
import { Images } from "@/assets/images";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import SearchBar from "@/components/SearchBar";
import { ConversationHeader } from "@/components/conversations/ConversationHeader";
import { WebGroupCreation } from "@/components/conversations/conversation-list/group-conversation-creation/web/WebGroupCreation";
import { PanelType } from "@/types/web-panel/types";
import SearchedConversationMessages from "@/components/SearchedConversationMessages";
import Animated, { useAnimatedStyle } from "react-native-reanimated";
import { AllParticipants } from "@/components/conversations/AllParticipants";
import ConversationForwardPanelWeb from "@/components/conversations/conversation-info-panel/forward-panel/WebForwardPanel";
import { EMPTY_SET } from "@/constants/constants";

export default function ChatInterface({
  chatItemList,
  conversationsRefetch,
  conversationsLoading,
  filters,
  selectedConversation,
  setSelectedConversation,
  onSearchQueryInserting = () => {},
  searchQuery = "",
}: ChatComponentProps) {
  const {
    selectedConversationType,
    setSelectedConversationType,
    setSelectionMode,
    setSelectedMessageIds,
  } = useConversationStore();

  const [showProfilePanel, setShowProfilePanel] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(Dimensions.get("window").width);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(470);
  const [messageToJump, setMessageToJump] = useState<number | null>(null);

  const { activePanel, isPanelContentReady, contentOpacity, widthAnim, openPanel, closePanel } =
    usePanelManager(screenWidth);

  const handleSearchMessageClick = useCallback((message: any) => {
    setMessageToJump(message.id);
  }, []);

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });
    return () => subscription?.remove();
  }, []);

  const handleForwardPanelClose = useCallback(() => {
    closePanel();
    setSelectionMode(false);
    setSelectedMessageIds(EMPTY_SET);
  }, [closePanel, setSelectionMode, setSelectedMessageIds]);

  const handleBackToPlaceholder = () => {
    setSelectedConversation?.(null);
    setShowProfilePanel(false);
  };

  const handleShowProfile = useCallback(() => {
    openPanel(PanelType.PROFILE);
  }, [openPanel]);

  const handleShowSearch = useCallback(() => {
    openPanel(PanelType.SEARCH);
  }, [openPanel]);

  const handleShowForward = useCallback(
    (ids?: Set<number>) => {
      if (ids && ids.size) setSelectedMessageIds(ids);
      openPanel(PanelType.FORWARD);
    },
    [openPanel, setSelectedMessageIds]
  );

  useEffect(() => {
    closePanel();
  }, [closePanel, selectedConversation?.id]);

  const renderPanelContent = () => {
    if (!isPanelContentReady || !selectedConversation) return null;

    switch (activePanel) {
      case PanelType.PROFILE:
        return (
          <ConversationInfoPanel
            conversationId={selectedConversation.id}
            onClose={closePanel}
            isWebView
            setSelectedConversation={setSelectedConversation}
          />
        );
      case PanelType.SEARCH:
        return (
          <SearchedConversationMessages
            conversationName={selectedConversation.name}
            conversationId={Number(selectedConversation.id)}
            onClose={closePanel}
            onMessageClicked={handleSearchMessageClick}
          />
        );
      case PanelType.PARTICIPANTS:
        return (
          <AllParticipants
            conversationId={selectedConversation.id}
            onClose={closePanel}
            visible={activePanel === PanelType.PARTICIPANTS}
          />
        );
      case PanelType.FORWARD:
        return <ConversationForwardPanelWeb onClose={handleForwardPanelClose} />;
      default:
        return null;
    }
  };

  const threadStyle = useAnimatedStyle(() => ({
    width: showProfilePanel ? screenWidth - widthAnim.value : screenWidth,
  }));

  const panelStyle = useAnimatedStyle(() => ({
    width: widthAnim.value,
  }));

  const panelContentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
  }));

  const renderMainContent = () => {
    return (
      <>
        <View
          onLayout={(event) => setLeftPaneWidth(Math.round(event.nativeEvent.layout.width))}
          style={{ position: "relative" }}
          className="w-[470px] min-w-72 max-w-2xl lg:w-[460px] bg-background-light dark:bg-background-dark border-r border-secondary-light dark:border-secondary-dark flex-shrink-0"
        >
          <ConversationHeader
            selectedConversationType={selectedConversationType}
            setSelectedConversationType={setSelectedConversationType}
            onRefresh={conversationsRefetch}
            isLoading={conversationsLoading}
            onCreateGroup={() => setShowCreateGroup(true)}
          />
          {selectedConversationType === ConversationType.ALL && (
            <View className="px-4 sm:px-6">
              <SearchBar
                value={searchQuery}
                onChangeText={onSearchQueryInserting}
                onClear={() => onSearchQueryInserting("")}
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

          <View className="flex-1 min-h-0">
            <View className="max-w-md mx-auto w-full flex-1 min-h-0">{chatItemList}</View>
          </View>

          {showCreateGroup && (
            <WebGroupCreation
              visible={showCreateGroup}
              width={leftPaneWidth}
              onClose={() => setShowCreateGroup(false)}
              onCreate={() => {
                conversationsRefetch();
                setShowCreateGroup(false);
              }}
              setSelectedConversation={setSelectedConversation}
            />
          )}
        </View>

        <Animated.View
          style={[{ flexGrow: 1, flexShrink: 1, minWidth: 0 }, threadStyle]}
          className="bg-background-light dark:bg-gray-900 border-r border-secondary-light dark:border-secondary-dark"
        >
          {selectedConversation ? (
            <ConversationThreadScreen
              conversationId={selectedConversation.id}
              webBackPress={handleBackToPlaceholder}
              onShowProfile={handleShowProfile}
              webSearchPress={handleShowSearch}
              webForwardPress={handleShowForward}
              messageToJump={messageToJump}
              onMessageJumped={() => setMessageToJump(null)}
            />
          ) : (
            <Placeholder
              title="No chat selected"
              subtitle="Choose a conversation from the list to view messages and start chatting"
              image={Images.NoChatSelected}
            />
          )}
        </Animated.View>

        <Animated.View
          style={[{ flexShrink: 0, overflow: "hidden" }, panelStyle]}
          className="bg-background-light dark:bg-gray-900"
        >
          <Animated.View
            style={[{ flex: 1 }, panelContentStyle]}
            className="bg-background-light dark:bg-gray-900"
          >
            {renderPanelContent()}
          </Animated.View>
        </Animated.View>
      </>
    );
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {screenWidth < 1024 ? (
        <ScrollView
          horizontal
          contentContainerStyle={{ flexGrow: 1 }}
          showsHorizontalScrollIndicator={false}
        >
          <View className="flex-row h-full min-w-full">{renderMainContent()}</View>
        </ScrollView>
      ) : (
        <View className="flex-row h-full">{renderMainContent()}</View>
      )}
    </View>
  );
}
