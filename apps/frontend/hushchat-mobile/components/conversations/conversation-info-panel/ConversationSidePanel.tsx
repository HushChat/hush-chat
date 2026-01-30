import { StyleSheet } from "react-native";
import { PanelType } from "@/types/web-panel/types";

import { MotionView } from "@/motion/MotionView";

import ConversationInfoPanel from "@/components/conversations/conversation-info-panel/ConversationInfoPanel";
import ConversationForwardPanelWeb from "@/components/conversations/conversation-info-panel/forward-panel/WebForwardPanel";
import MessageInfoPanel from "@/components/conversations/conversation-thread/MessageInfoPanel";
import { AllParticipants } from "@/components/conversations/AllParticipants";
import SearchedConversationMessages from "@/components/SearchedConversationMessages";
import { IConversation } from "@/types/chat/types";

interface IConversationSidePanel {
  selectedConversation: IConversation | null;
  activePanel: PanelType | null;
  isPanelOpen: boolean;
  isPanelContentReady: boolean;
  panelWidth: number;
  selectedMessageId: number;
  onClose: () => void;
  onForwardClose: () => void;
  onSearchMessageClick: (message: any) => void;
}

const ConversationSidePanel = ({
  selectedConversation,
  activePanel,
  isPanelOpen,
  isPanelContentReady,
  panelWidth,
  selectedMessageId,
  onClose,
  onForwardClose,
  onSearchMessageClick,
}: IConversationSidePanel) => {
  if (!selectedConversation) return null;

  const renderContent = () => {
    switch (activePanel) {
      case PanelType.PROFILE:
        return (
          <ConversationInfoPanel
            conversationId={selectedConversation.id}
            onClose={onClose}
            isWebView
          />
        );

      case PanelType.SEARCH:
        return (
          <SearchedConversationMessages
            conversationName={selectedConversation.name}
            conversationId={selectedConversation.id}
            onClose={onClose}
            onMessageClicked={onSearchMessageClick}
          />
        );

      case PanelType.PARTICIPANTS:
        return (
          <AllParticipants conversationId={selectedConversation.id} onClose={onClose} visible />
        );

      case PanelType.FORWARD:
        return (
          <ConversationForwardPanelWeb
            currentConversationId={selectedConversation.id}
            onClose={onForwardClose}
          />
        );

      case PanelType.MESSAGE_INFO:
        return (
          <MessageInfoPanel
            conversationId={selectedConversation.id}
            messageId={selectedMessageId}
            visible
            onClose={onClose}
          />
        );

      default:
        return null;
    }
  };

  return (
    <MotionView
      visible={isPanelOpen}
      from={{ width: 0, opacity: 0 }}
      to={{ width: panelWidth, opacity: 1 }}
      duration={300}
      easing="decelerate"
      className="bg-background-light dark:bg-gray-900"
      style={[styles.panel, { position: isPanelOpen ? "relative" : "absolute" }]}
    >
      <MotionView
        visible={isPanelContentReady}
        preset="fadeIn"
        duration={200}
        delay={100}
        style={styles.flex1}
      >
        {renderContent()}
      </MotionView>
    </MotionView>
  );
};

export default ConversationSidePanel;

const styles = StyleSheet.create({
  panel: {
    flexShrink: 0,
    overflow: "hidden",
    right: 0,
  },
  flex1: {
    flex: 1,
  },
});
