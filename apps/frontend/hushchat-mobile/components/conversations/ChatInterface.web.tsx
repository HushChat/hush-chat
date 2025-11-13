import { View, Dimensions } from "react-native";
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
import { AllParticipants } from "@/components/conversations/AllParticipants";
import ConversationForwardPanelWeb from "@/components/conversations/conversation-info-panel/forward-panel/WebForwardPanel";
import { EMPTY_SET } from "@/constants/constants";
import { MotionView } from "@/motion/MotionView";

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

  const [screenWidth, setScreenWidth] = useState<number>(Dimensions.get("window").width);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(470);
  const [messageToJump, setMessageToJump] = useState<number | null>(null);

  const { activePanel, isPanelOpen, isPanelContentReady, panelWidth, openPanel, closePanel } =
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
    if (!selectedConversation) return null;

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

  const threadWidth = isPanelOpen ? screenWidth - panelWidth : screenWidth;

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-row h-full relative">
        {/* Left sidebar - conversations list */}
        <View
          onLayout={(event) => setLeftPaneWidth(Math.round(event.nativeEvent.layout.width))}
          style={{ position: "relative" }}
          className="w-[470px] min-w-72 max-w-2xl lg:w-[460px] bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800"
        >
          <ConversationHeader
            selectedConversationType={selectedConversationType}
            setSelectedConversationType={setSelectedConversationType}
            onRefresh={conversationsRefetch}
            isLoading={conversationsLoading}
            onCreateGroup={() => setShowCreateGroup(true)}
          />
          {selectedConversationType === ConversationType.ALL && (
            <View className="px-5">
              <SearchBar
                value={searchQuery}
                onChangeText={onSearchQueryInserting}
                onClear={() => onSearchQueryInserting("")}
              />
            </View>
          )}

          {selectedConversationType !== ConversationType.ARCHIVED && (
            <View className="px-6 py-3">
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

        <MotionView
          visible={true}
          from={{ width: screenWidth }}
          to={{ width: threadWidth }}
          duration={300}
          easing="decelerate"
          style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}
          className="bg-background-light dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
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
        </MotionView>

        <MotionView
          visible={isPanelOpen}
          from={{ width: 0, opacity: 0 }}
          to={{ width: panelWidth, opacity: 1 }}
          duration={300}
          easing="decelerate"
          style={{
            flexShrink: 0,
            overflow: "hidden",
            position: isPanelOpen ? "relative" : "absolute",
            right: 0,
          }}
          className="bg-background-light dark:bg-gray-900"
        >
          <MotionView
            visible={isPanelContentReady}
            preset="fadeIn"
            duration={200}
            delay={100}
            style={{ flex: 1 }}
            className="bg-background-light dark:bg-gray-900"
          >
            {isPanelContentReady && renderPanelContent()}
          </MotionView>
        </MotionView>
      </View>
    </View>
  );
}
