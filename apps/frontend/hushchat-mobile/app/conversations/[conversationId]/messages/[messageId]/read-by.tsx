import { useLocalSearchParams } from "expo-router";
import React from "react";
import MessageInfoPanel from "@/components/conversations/conversation-thread/MessageInfoPanel";

export default function ConversationMessageReadByScreen() {
  const { conversationId, messageId } = useLocalSearchParams<{
    conversationId: string;
    messageId: string;
  }>();

  return <MessageInfoPanel conversationId={Number(conversationId)} messageId={Number(messageId)} />;
}
