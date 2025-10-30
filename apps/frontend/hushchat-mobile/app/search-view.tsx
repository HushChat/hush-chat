import SearchedConversationMessages from "@/components/SearchedConversationMessages";
import { PLATFORM } from "@/constants/platformConstants";
import { useLocalSearchParams } from "expo-router";
import { KeyboardAvoidingView } from "react-native";
import {
  useSafeAreaInsets,
  SafeAreaView,
} from "react-native-safe-area-context";

const SearchView = ({ onClose }: { onClose: () => void }) => {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { conversationId, conversationName } = params;

  return (
    <SafeAreaView
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={PLATFORM.IS_ANDROID && { paddingBottom: insets.bottom }}
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={PLATFORM.IS_IOS ? "padding" : "height"}
      >
        <SearchedConversationMessages
          conversationId={Number(conversationId)}
          conversationName={String(conversationName)}
          onClose={onClose}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SearchView;
