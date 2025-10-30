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

import React from "react";
import { View, Text, TextInput } from "react-native";
import {
  ConversationsMultiSelect,
  TConversation,
} from "@/components/ConversationsMultiSelect";
import { PLATFORM } from "@/constants/platformConstants";
import { ForwardPanelFooter } from "@/components/conversations/conversation-info-panel/forward-panel/ForwardPanelFooter";

export interface ConversationForwardPanelBaseProps {
  onClose: () => void;
  selectedConversations: TConversation[];
  setSelectedConversations: (conversations: TConversation[]) => void;
  customText: string;
  setCustomText: (text: string) => void;
  canSend: boolean;
  isPending: boolean;
  handleSend: () => void;
  resetSelection: () => void;
}

const ConversationForwardPanelBase = ({
  onClose,
  selectedConversations,
  setSelectedConversations,
  customText,
  setCustomText,
  canSend,
  isPending,
  handleSend,
  resetSelection,
}: ConversationForwardPanelBaseProps) => {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="px-4 pt-3">
        <Text className="text-sm text-text-secondary-light dark:text-text-secondary-dark mb-2">
          Add a note (optional)
        </Text>
        <TextInput
          value={customText}
          onChangeText={setCustomText}
          placeholder="Type a note to send with the forwarded messages…"
          placeholderTextColor="#9CA3AF"
          multiline
          className="min-h-[64px] rounded-lg px-3 py-2 text-gray-900 dark:text-white bg-gray-100 dark:bg-secondary-dark"
        />
      </View>

      <View className="flex-1 min-h-0 mt-3">
        <ConversationsMultiSelect
          selectedConversations={selectedConversations}
          onChange={setSelectedConversations}
          searchPlaceholder="Search conversations to forward…"
        />
      </View>

      {PLATFORM.IS_WEB && (
        <ForwardPanelFooter
          isPending={isPending}
          canSend={canSend}
          selectedCount={selectedConversations.length}
          onCancel={() => {
            resetSelection();
            onClose();
          }}
          onSend={handleSend}
        />
      )}
    </View>
  );
};

export default ConversationForwardPanelBase;
