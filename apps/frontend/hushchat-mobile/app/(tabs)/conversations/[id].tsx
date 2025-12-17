import { Redirect, useLocalSearchParams } from "expo-router";
import ConversationScreen from "@/components/conversations/ConversationScreen";
import { PLATFORM } from "@/constants/platformConstants";

export default function ConversationDetailScreen() {
  const { id, messageId } = useLocalSearchParams<{ id: string; messageId?: string }>();

  if (!PLATFORM.IS_WEB && messageId) {
    return (
      <Redirect
        href={`/conversation-threads?conversationId=${id}${messageId ? `&messageId=${messageId}` : ""}`}
      />
    );
  }

  return <ConversationScreen initialConversationId={Number(id)} />;
}
