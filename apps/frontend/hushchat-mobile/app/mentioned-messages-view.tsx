import MentionedMessageListView from "@/components/conversations/conversation-list/MentionedMessageListView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { View } from "react-native";

export default function MentionedMessagesView() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View
        style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom }}
        className="flex-1 bg-white dark:bg-background-dark "
      >
        <MentionedMessageListView />
      </View>
    </View>
  );
}
