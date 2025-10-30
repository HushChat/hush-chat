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
import { View } from "react-native";
import { router } from "expo-router";
import MobileHeader from "@/components/MobileHeader";
import ConversationForwardPanelBase from "@/components/conversations/conversation-info-panel/forward-panel/ConversationForwardPanel";
import { useForwardMessageHandler } from "@/hooks/useForwardMessageHandler";

const ConversationForwardPanelNative = () => {
  const handler = useForwardMessageHandler(() => router.back());

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <MobileHeader
        title={`Forward (${handler.selectedCount})`}
        onBack={() => {
          handler.resetSelection();
          router.back();
        }}
        rightAction={{
          label: handler.isPending ? "Sending…" : "Send",
          disabled: !handler.canSend,
          onPress: handler.handleSend,
        }}
      />

      <ConversationForwardPanelBase
        onClose={() => router.back()}
        {...handler}
      />
    </View>
  );
};

export default ConversationForwardPanelNative;
