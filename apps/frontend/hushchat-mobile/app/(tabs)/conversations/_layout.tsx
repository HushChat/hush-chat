import { View } from "react-native";
import { Slot } from "expo-router";
import { PLATFORM } from "@/constants/platformConstants";
import ConversationSidebar from "@/components/conversations/conversation-list/ConversationSidebar/CoversationSidebar";

export default function ConversationsLayout() {
  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <ConversationSidebar />

      {PLATFORM.IS_WEB && <Slot />}
    </View>
  );
}
