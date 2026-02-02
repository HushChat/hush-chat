import React from "react";
import { View } from "react-native";
import { ConversationsMultiSelect, TConversation } from "@/components/ConversationsMultiSelect";
import { PLATFORM } from "@/constants/platformConstants";
import { ForwardPanelFooter } from "@/components/conversations/conversation-info-panel/forward-panel/ForwardPanelFooter";
import { AppText } from "@/components/AppText";
import ConversationInput from "@/components/conversation-input/ConversationInput/ConversationInput";

export interface ConversationForwardPanelBaseProps {
  onClose: () => void;
  selectedConversations: TConversation[];
  setSelectedConversations: (conversations: TConversation[]) => void;
  customText: string;
  setCustomText: (text: string) => void;
  canSend: boolean;
  isPending: boolean;
  handleSend: () => void;
  resetSelection: () => void;
  sourceConversationId: number;
  isMarkdownEnabled: boolean;
  setIsMarkdownEnabled: (enabled: boolean) => void;
}

const ConversationForwardPanelBase = ({
  onClose,
  selectedConversations,
  setSelectedConversations,
  customText,
  setCustomText,
  canSend,
  isPending,
  handleSend,
  resetSelection,
  sourceConversationId,
  isMarkdownEnabled,
  setIsMarkdownEnabled,
}: ConversationForwardPanelBaseProps) => {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="px-4 pt-3">
        <AppText className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
          Add a note (optional)
        </AppText>
        <View className="rounded-lg overflow-hidden">
          <View className="-m-4">
            <ConversationInput
              conversationId={sourceConversationId}
              onSendMessage={handleSend}
              disabled={isPending}
              isSending={isPending}
              controlledValue={customText}
              onControlledValueChange={setCustomText}
              hideSendButton
              hideEmojiGifPickers
              controlledMarkdownEnabled={isMarkdownEnabled}
              onControlledMarkdownChange={setIsMarkdownEnabled}
            />
          </View>
        </View>
      </View>

      <View className="flex-1 min-h-0 mt-3">
        <ConversationsMultiSelect
          selectedConversations={selectedConversations}
          onChange={setSelectedConversations}
          searchPlaceholder="Search conversations to forward…"
          sourceConversationId={sourceConversationId}
          autoFocusSearch={true}
        />
      </View>

      {PLATFORM.IS_WEB && (
        <ForwardPanelFooter
          isPending={isPending}
          canSend={canSend}
          selectedCount={selectedConversations.length}
          onCancel={() => {
            resetSelection();
            onClose();
          }}
          onSend={handleSend}
        />
      )}
    </View>
  );
};

export default ConversationForwardPanelBase;
