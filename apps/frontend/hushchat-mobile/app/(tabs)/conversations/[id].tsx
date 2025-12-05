import { useLocalSearchParams } from "expo-router";
import ConversationScreen from "@/components/conversations/ConversationScreen";

export default function ConversationDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return <ConversationScreen initialConversationId={Number(id)} />;
}
