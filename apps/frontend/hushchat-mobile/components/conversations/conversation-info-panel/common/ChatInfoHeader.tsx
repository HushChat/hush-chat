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
import { View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { DEFAULT_ACTIVE_OPACITY, DEFAULT_HIT_SLOP } from "@/constants/ui";
import { PLATFORM } from "@/constants/platformConstants";
import ChatInfoNameBar from "@/components/conversations/conversation-info-panel/common/ChatInfoNameBar";
import { useAppTheme } from "@/hooks/useAppTheme";

type ChatInfoHeaderProps = {
  title: string;
  onBack: () => void;
  showActions?: boolean;
  onPressChat?: () => void;
  onPressCall?: () => void;
  imageUrl: string;
  onPressSearch: () => void;
};

export default function ChatInfoHeader({
  title,
  onBack,
  showActions,
  onPressChat,
  onPressCall,
  imageUrl,
  onPressSearch,
}: ChatInfoHeaderProps) {
  const insets = useSafeAreaInsets();

  const { isDark } = useAppTheme();

  return (
    <View>
      <View
        style={{
          paddingTop: insets.top,
          height: 320 + insets.top,
          position: "relative",
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ height: 320 }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
        <TouchableOpacity
          onPress={onBack}
          className={classNames(
            "absolute m-3 z-2 p-2 rounded-full",
            PLATFORM.IS_WEB && "hover:bg-gray-900/20",
            !PLATFORM.IS_WEB && "active:bg-gray-900/20",
          )}
          hitSlop={DEFAULT_HIT_SLOP}
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
        >
          <Ionicons
            name={`${PLATFORM.IS_WEB ? "close" : "arrow-back"}`}
            size={PLATFORM.IS_WEB ? 26 : 24}
            color={isDark ? "#ffffff" : "#111827"}
          />
        </TouchableOpacity>
      </View>
      <ChatInfoNameBar
        title={title}
        showActions={!!showActions}
        onPressChat={onPressChat}
        onPressCall={onPressCall}
        onPressSearch={onPressSearch}
      />
    </View>
  );
}
