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
import { View, Text, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { PLATFORM } from "@/constants/platformConstants";
import InitialsAvatar from "@/components/InitialsAvatar";

interface SelectableListItemProps {
  title: string;
  subtitle?: string;
  isSelected: boolean;
  onToggle: () => void;
}

export const SelectableListItem = ({
  title,
  subtitle,
  isSelected,
  onToggle,
}: SelectableListItemProps) => (
  <Pressable
    className={classNames(
      "group flex-row items-center gap-3 px-4 py-3 transition-colors duration-200 active:bg-secondary-light dark:active:bg-secondary-dark",
      PLATFORM.IS_WEB && "hover:bg-blue-100/60 hover:dark:bg-secondary-dark",
      { "bg-blue-100/60 dark:bg-secondary-dark": isSelected },
    )}
    onPress={onToggle}
  >
    <InitialsAvatar name={title} />
    <View className="flex-1 flex-row justify-between items-center mr-3">
      <View className="flex-col items-start mb-1 gap-0.5">
        <Text className="text-text-primary-light dark:text-text-primary-dark font-medium text-base">
          {title}
        </Text>
        {!!subtitle && (
          <Text
            className="text-gray-600 dark:text-text-secondary-dark text-sm"
            numberOfLines={1}
          >
            {subtitle}
          </Text>
        )}
      </View>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={20} color="#60A5FA" />
      )}
    </View>
  </Pressable>
);
