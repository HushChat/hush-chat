import React from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import MobileHeader from "@/components/MobileHeader";
import ConversationForwardPanelBase from "@/components/conversations/conversation-info-panel/forward-panel/ConversationForwardPanel";
import { useForwardMessageHandler } from "@/hooks/useForwardMessageHandler";

const ConversationForwardPanelNative = () => {
  const handler = useForwardMessageHandler(() => router.back());
  const params = useLocalSearchParams();
  const currentConversationId = Number(params.currentConversationId);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <MobileHeader
        title={`Forward (${handler.selectedCount})`}
        onBack={() => {
          handler.resetSelection();
          router.back();
        }}
        rightAction={{
          label: handler.isPending ? "Sending…" : "Send",
          disabled: !handler.canSend,
          onPress: handler.handleSend,
        }}
      />

      <ConversationForwardPanelBase
        onClose={() => router.back()}
        {...handler}
        sourceConversationId={currentConversationId}
      />
    </View>
  );
};

export default ConversationForwardPanelNative;
