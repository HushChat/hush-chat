import { Slot } from "expo-router";
import { View } from "react-native";
import ConversationSidebar from "@/components/conversations/conversation-list/CoversationSidebar";

export default function ConversationsLayout() {
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <ConversationSidebar />

      <Slot />
    </View>
  );
}
