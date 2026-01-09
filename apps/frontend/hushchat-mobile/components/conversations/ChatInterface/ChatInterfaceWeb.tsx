import { View, Dimensions, StyleSheet, ScrollView } from "react-native";
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
import MentionedMessageListView from "@/components/conversations/conversation-list/MentionedMessageListView";
import { MotionEasing } from "@/motion/easing";
import MessageInfoPanel from "@/components/conversations/conversation-thread/MessageInfoPanel.web";

export default function ChatInterfaceWeb({
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
  const [showMentionedMessages, setShowMentionedMessages] = useState(false);
  const [leftPaneWidth, setLeftPaneWidth] = useState(470);
  const [messageToJump, setMessageToJump] = useState<number | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<number>(0);

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

  const handleShowMessageInfo = useCallback(
    (messageId: number) => {
      openPanel(PanelType.MESSAGE_INFO);
      setSelectedMessageId(messageId);
    },
    [setSelectedMessageId]
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
        return (
          <ConversationForwardPanelWeb
            onClose={handleForwardPanelClose}
            currentConversationId={selectedConversation.id}
          />
        );
      case PanelType.MESSAGE_INFO:
        return (
          <MessageInfoPanel
            conversationId={selectedConversation.id}
            messageId={selectedMessageId}
            visible={activePanel === PanelType.MESSAGE_INFO}
            onClose={closePanel}
          />
        );
      default:
        return null;
    }
  };

  const threadWidth = isPanelOpen ? screenWidth - panelWidth : screenWidth;

  const renderMainContent = () => {
    return (
      <>
        <View
          onLayout={(event) => setLeftPaneWidth(Math.round(event.nativeEvent.layout.width))}
          className="w-[470px] min-w-72 max-w-2xl lg:w-[460px] bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 h-full"
          style={styles.leftPaneContainer}
        >
          <ConversationHeader
            selectedConversationType={selectedConversationType}
            setSelectedConversationType={setSelectedConversationType}
            onRefresh={conversationsRefetch}
            isLoading={conversationsLoading}
            onCreateGroup={() => setShowCreateGroup(true)}
            onOpenMentionedMessages={() => setShowMentionedMessages(true)}
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

          {showMentionedMessages && (
            <MotionView
              visible={showMentionedMessages}
              className="flex-1 absolute top-0 bottom-0 left-0 right-0 dark:!bg-secondar"
              delay={40}
              from={{ opacity: 0, translateX: screenWidth }}
              to={{ opacity: 1, translateX: 0 }}
              duration={{ enter: 240, exit: 200 }}
              easing={MotionEasing.pair}
            >
              <MentionedMessageListView
                onClose={() => setShowMentionedMessages(false)}
                onMessageClicked={handleSearchMessageClick}
                setSelectedConversation={setSelectedConversation}
              />
            </MotionView>
          )}
        </View>

        <MotionView
          visible={true}
          from={{ width: screenWidth }}
          to={{ width: threadWidth }}
          duration={300}
          easing="decelerate"
          className="bg-background-light dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800"
          style={styles.threadMotion}
        >
          {selectedConversation ? (
            <ConversationThreadScreen
              conversationId={selectedConversation.id}
              onShowProfile={handleShowProfile}
              webSearchPress={handleShowSearch}
              webForwardPress={handleShowForward}
              webMessageInfoPress={handleShowMessageInfo}
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
          className="bg-background-light dark:bg-gray-900"
          style={[styles.rightPanel, getRightPanelPosition(isPanelOpen)]}
        >
          <MotionView
            visible={isPanelContentReady}
            preset="fadeIn"
            duration={200}
            delay={100}
            className="bg-background-light dark:bg-gray-900"
            style={styles.flex1}
          >
            {isPanelContentReady && renderPanelContent()}
          </MotionView>
        </MotionView>
      </>
    );
  };

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {screenWidth < 1024 ? (
        <ScrollView
          horizontal
          contentContainerStyle={styles.scrollHorizontalContent}
          showsHorizontalScrollIndicator={false}
          style={styles.scrollContainer}
        >
          <View className="flex-row h-full">{renderMainContent()}</View>
        </ScrollView>
      ) : (
        <View className="flex-row h-full relative">{renderMainContent()}</View>
      )}
    </View>
  );
}

const getRightPanelPosition = (open: boolean): { position: "relative" | "absolute" } => ({
  position: open ? "relative" : "absolute",
});

const styles = StyleSheet.create({
  leftPaneContainer: {
    position: "relative",
    flexShrink: 0,
  },
  threadMotion: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  rightPanel: {
    flexShrink: 0,
    overflow: "hidden",
    right: 0,
  },
  flex1: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollHorizontalContent: {
    flexGrow: 1,
  },
});
