import { useCallback, useEffect, useState } from "react";
import { View, Dimensions } from "react-native";
import { useGlobalSearchParams } from "expo-router";
import { IConversation } from "@/types/chat/types";
import { PanelType } from "@/types/web-panel/types";
import { EMPTY_SET } from "@/constants/constants";
import usePanelManager from "@/hooks/useWebPanelManager";
import { useLinkConversation } from "@/hooks/useLinkConversation";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { useConversationNavigation } from "@/contexts/ConversationNavigationContext";
import ConversationThreadScreen from "@/app/conversation-threads";
import ConversationSidePanel from "@/components/conversations/conversation-info-panel/ConversationSidePanel";

export default function ChatInterfaceWeb() {
  const { setSelectionMode, setSelectedMessageIds } = useConversationStore();
  const { messageToJump: contextMessageToJump, clearMessageToJump } = useConversationNavigation();

  const { id } = useGlobalSearchParams<{ id?: string }>();
  const conversationId = id ? Number(id) : null;

  const { conversationsPages } = useConversationsQuery({});
  const conversations = conversationsPages?.pages.flatMap((page) => page.content) ?? [];
  const [selectedConversation, setSelectedConversation] = useState<IConversation | null>(null);

  const [screenWidth, setScreenWidth] = useState(Dimensions.get("window").width);
  const [localMessageToJump, setLocalMessageToJump] = useState<number | null>(null);
  const [selectedMessageId, setSelectedMessageId] = useState<number>(0);

  // Combine both sources - context (from sidebar) and local (from side panel)
  const messageToJump = contextMessageToJump ?? localMessageToJump;

  const handleMessageJumped = useCallback(() => {
    clearMessageToJump();
    setLocalMessageToJump(null);
  }, [clearMessageToJump]);

  const { activePanel, isPanelOpen, isPanelContentReady, panelWidth, openPanel, closePanel } =
    usePanelManager(screenWidth);

  useLinkConversation({
    initialConversationId: conversationId ?? undefined,
    conversations,
    onConversationFound: setSelectedConversation,
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setScreenWidth(window.width);
    });

    return () => subscription?.remove();
  }, []);

  useEffect(() => {
    closePanel();
  }, [closePanel, selectedConversation?.id]);

  // For side panel search
  const handleSearchMessageClick = useCallback((message: any) => {
    if (message?.id) {
      setLocalMessageToJump(message.id);
    }
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
      if (ids?.size) setSelectedMessageIds(ids);
      openPanel(PanelType.FORWARD);
    },
    [openPanel, setSelectedMessageIds]
  );

  const handleShowMessageInfo = useCallback(
    (messageId: number) => {
      setSelectedMessageId(messageId);
      openPanel(PanelType.MESSAGE_INFO);
    },
    [openPanel]
  );

  const renderMainContent = () => (
    <>
      {selectedConversation && (
        <ConversationThreadScreen
          conversationId={selectedConversation.id}
          onShowProfile={handleShowProfile}
          webSearchPress={handleShowSearch}
          webForwardPress={handleShowForward}
          webMessageInfoPress={handleShowMessageInfo}
          messageToJump={messageToJump}
          onMessageJumped={handleMessageJumped}
        />
      )}

      <ConversationSidePanel
        selectedConversation={selectedConversation}
        activePanel={activePanel}
        isPanelOpen={isPanelOpen}
        isPanelContentReady={isPanelContentReady}
        panelWidth={panelWidth}
        selectedMessageId={selectedMessageId}
        onClose={closePanel}
        onForwardClose={handleForwardPanelClose}
        onSearchMessageClick={handleSearchMessageClick}
      />
    </>
  );

  return (
    <View className="flex-row flex-1 bg-background-light dark:bg-background-dark">
      {renderMainContent()}
    </View>
  );
}
