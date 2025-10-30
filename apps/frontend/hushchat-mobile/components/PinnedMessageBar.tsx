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

import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useAppTheme } from "@/hooks/useAppTheme";

interface PinnedMessageBarProps {
  senderName: string;
  messageText: string;
  onPress?: () => void;
  onUnpin?: () => void;
}

export const PinnedMessageBar = ({
  senderName,
  messageText,
  onPress,
  onUnpin,
}: PinnedMessageBarProps) => {
  const { isDark } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 bg-secondary-light/40 dark:bg-secondary-dark/40 border-l-4 border-primary-light dark:border-primary-dark shadow-sm"
      style={{
        boxShadow: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
      }}
    >
      <View className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-400/10 items-center justify-center mr-3">
        <Ionicons
          name="pin"
          size={16}
          style={{ transform: [{ rotate: "45deg" }] }}
          className="!text-primary-light dark:!text-primary-dark"
        />
      </View>

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center mb-0.5">
          <Text className="text-xs font-medium text-primary-light dark:text-text-primary-dark uppercase tracking-wide">
            Pinned
          </Text>
          <View className="w-1 h-1 rounded-full bg-primary-light dark:bg-primary-dark mx-2" />
          <Text className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {senderName}
          </Text>
        </View>
        <Text
          className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
          numberOfLines={2}
        >
          {messageText}
        </Text>
      </View>

      <Pressable
        onPress={onUnpin}
        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 items-center justify-center ml-3"
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Ionicons
          name="close"
          size={14}
          color={isDark ? "#FAFAF9" : "#050506"}
        />
      </Pressable>
    </Pressable>
  );
};
