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

/**
 * SwipeActionButton
 *
 * A reusable button component revealed by swipe gestures on list items.
 */
import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

export interface SwipeActionProps {
  onPress: () => void;
  backgroundColor?: string;
  iconName: keyof typeof Ionicons.glyphMap;
  text: string;
}

export default function SwipeActionItem({
  onPress,
  backgroundColor = "bg-gray-500",
  iconName,
  text,
}: SwipeActionProps) {
  const { isDark } = useAppTheme();

  const getActionColor = () => {
    if (backgroundColor.includes("green")) {
      return isDark ? "#128C7E" : "#25D366";
    }
    if (backgroundColor.includes("red")) {
      return isDark ? "#DC143C" : "#FF3B30";
    }
    if (backgroundColor.includes("blue")) {
      return isDark ? "#007AFF" : "#0084FF";
    }
    return isDark ? "#34495e" : "#95a5a6";
  };

  const actionColor = getActionColor();

  return (
    <TouchableOpacity
      className="w-20 h-full items-center justify-center"
      style={{ backgroundColor: actionColor }}
      onPress={onPress}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
    >
      <View className="items-center justify-center flex-1 px-2">
        <View className="items-center justify-center mb-1">
          <Ionicons name={iconName} size={24} color="white" />
        </View>

        <Text className="text-white text-xs font-semibold">{text}</Text>
      </View>
    </TouchableOpacity>
  );
}
