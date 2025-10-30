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
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ConversationForwardPanelBase from "@/components/conversations/conversation-info-panel/forward-panel/ConversationForwardPanel";
import { useForwardMessageHandler } from "@/hooks/useForwardMessageHandler";

const ConversationForwardPanelWeb = ({ onClose }: { onClose: () => void }) => {
  const handler = useForwardMessageHandler(onClose);

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-row items-center justify-between px-4 py-5 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center">
          <Text className="ml-2 text-base font-medium text-text-primary-light dark:text-text-primary-dark">
            Forward messages ({handler.selectedCount})
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            handler.resetSelection();
            onClose();
          }}
        >
          <Ionicons name="close" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <ConversationForwardPanelBase onClose={onClose} {...handler} />
    </View>
  );
};

export default ConversationForwardPanelWeb;
