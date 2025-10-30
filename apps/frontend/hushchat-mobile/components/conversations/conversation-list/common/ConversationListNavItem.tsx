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
 * ConversationListNavItem
 *
 * A single navigational row inside the conversations list (e.g., “Archived”).
 * - Renders an Ionicon + label with light/dark theme-aware colors.
 * - Triggers the provided `action` when pressed.
 * - Styled for both web and native via React Native classes.
 */
import { View, TouchableOpacity, useColorScheme } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

interface ChatListOptionProps {
  title: string;
  iconName: keyof typeof Ionicons.glyphMap;
  action: () => void;
}

const ConversationListNavItem = ({
  title,
  iconName,
  action,
}: ChatListOptionProps) => {
  const colorScheme = useColorScheme() ?? "light";
  const isDark = colorScheme === "dark";

  return (
    <View className="bg-white dark:bg-gray-900">
      <TouchableOpacity
        onPress={action}
        className="flex-row items-center px-4 py-4 bg-background-light dark:bg-background-dark active:bg-gray-50 dark:active:bg-gray-800 hover:bg-gray-100 hover:dark:bg-gray-800"
        activeOpacity={DEFAULT_ACTIVE_OPACITY}
      >
        <View className="w-6 h-6 items-center justify-center">
          <Ionicons
            name={iconName}
            size={22}
            color={isDark ? "#ffffff" : "#000000"}
          />
        </View>
        <View className="flex-1 ml-4 flex-row items-center justify-between">
          <AppText className="text-gray-900 dark:text-white font-medium text-base">
            {title}
          </AppText>
        </View>
      </TouchableOpacity>
    </View>
  );
};

export default ConversationListNavItem;
