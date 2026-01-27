import { View } from "react-native";
import { Slot } from "expo-router";
import { PLATFORM } from "@/constants/platformConstants";
import ConversationSidebar from "@/components/conversations/conversation-list/ConversationSidebar/CoversationSidebar";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { ConversationNavigationProvider } from "@/contexts/ConversationNavigationContext";

export default function ConversationsLayout() {
  const isMobileLayout = useIsMobileLayout();
  const mobileSelected = !PLATFORM.IS_WEB || isMobileLayout;

  return (
    <ConversationNavigationProvider>
      <View style={{ flex: 1, flexDirection: "row" }}>
        <ConversationSidebar />

        {!mobileSelected && <Slot />}
      </View>
    </ConversationNavigationProvider>
  );
}
