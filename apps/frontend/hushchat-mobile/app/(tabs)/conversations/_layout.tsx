import { Pressable, View } from "react-native";
import { Slot } from "expo-router";
import { PLATFORM } from "@/constants/platformConstants";
import ConversationSidebar from "@/components/conversations/conversation-list/ConversationSidebar/CoversationSidebar";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { useSearchFocusStore } from "@/store/search/useSearchFocusStore";
import { MotionView } from "@/motion/MotionView";
import { MotionEasing } from "@/motion/easing";

export default function ConversationsLayout() {
  const isMobileLayout = useIsMobileLayout();
  const mobileSelected = !PLATFORM.IS_WEB || isMobileLayout;
  const isSearchFocused = useSearchFocusStore((s) => s.isSearchFocused);
  const setSearchFocused = useSearchFocusStore((s) => s.setSearchFocused);

  return (
    <View style={{ flex: 1, flexDirection: "row" }}>
      <ConversationSidebar />

      {!mobileSelected && (
        <View style={{ flex: 1, position: "relative" }}>
          <Slot />
          <MotionView
            visible={isSearchFocused}
            pointerEvents={isSearchFocused ? "auto" : "none"}
            className="absolute inset-0 bg-black/20 dark:bg-black/30 backdrop-blur-sm z-10"
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            duration={{ enter: 250, exit: 200 }}
            easing={MotionEasing.pair}
          >
            <Pressable style={{ flex: 1 }} onPress={() => setSearchFocused(false)} />
          </MotionView>
        </View>
      )}
    </View>
  );
}
