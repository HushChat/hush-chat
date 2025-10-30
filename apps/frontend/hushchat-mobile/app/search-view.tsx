/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

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
