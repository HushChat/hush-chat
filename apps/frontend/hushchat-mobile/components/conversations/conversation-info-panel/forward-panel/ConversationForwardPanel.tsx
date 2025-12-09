import React from "react";
import { View, Text, TextInput } from "react-native";
import { ConversationsMultiSelect, TConversation } from "@/components/ConversationsMultiSelect";
import { PLATFORM } from "@/constants/platformConstants";
import { ForwardPanelFooter } from "@/components/conversations/conversation-info-panel/forward-panel/ForwardPanelFooter";

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
}: ConversationForwardPanelBaseProps) => {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="px-4 pt-3">
        <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
          Add a note (optional)
        </Text>
        <TextInput
          value={customText}
          onChangeText={setCustomText}
          placeholder="Type a note to send with the forwarded messages…"
          placeholderTextColor="#9CA3AF"
          multiline
          className="min-h-[64px] rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-secondary-dark"
        />
      </View>

      <View className="flex-1 min-h-0 mt-3">
        <ConversationsMultiSelect
          selectedConversations={selectedConversations}
          onChange={setSelectedConversations}
          searchPlaceholder="Search conversations to forward…"
          sourceConversationId={sourceConversationId}
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
