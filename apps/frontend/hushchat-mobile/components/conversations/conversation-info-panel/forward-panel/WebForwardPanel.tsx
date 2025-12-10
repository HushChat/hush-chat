import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConversationForwardPanelBase from "@/components/conversations/conversation-info-panel/forward-panel/ConversationForwardPanel";
import { useForwardMessageHandler } from "@/hooks/useForwardMessageHandler";
import { AppText } from "@/components/AppText";

const ConversationForwardPanelWeb = ({
  onClose,
  currentConversationId,
}: {
  onClose: () => void;
  currentConversationId: number;
}) => {
  const handler = useForwardMessageHandler(onClose);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-row items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center">
          <AppText className="ml-2 text-base font-medium text-text-primary-light dark:text-text-primary-dark">
            Forward messages ({handler.selectedCount})
          </AppText>
        </View>
        <TouchableOpacity
          onPress={() => {
            handler.resetSelection();
            onClose();
          }}
        >
          <Ionicons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ConversationForwardPanelBase
        onClose={onClose}
        {...handler}
        sourceConversationId={currentConversationId}
      />
    </View>
  );
};

export default ConversationForwardPanelWeb;
