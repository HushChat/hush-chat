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

import { TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

interface RefreshButtonProps {
  onRefresh: () => void;
  isLoading?: boolean;
  size?: number;
  color?: string;
  disabled?: boolean;
}

export default function RefreshButton({
  onRefresh,
  isLoading = false,
  size = 20,
  color,
  disabled = false,
}: RefreshButtonProps) {
  const handlePress = () => {
    if (!disabled && !isLoading && onRefresh) {
      onRefresh();
    }
  };

  const isDisabled = disabled || isLoading || !onRefresh;

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={isDisabled}
      className={classNames("p-2 rounded-full", {
        "opacity-50": isDisabled,
        "hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600":
          !isDisabled,
      })}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
    >
      {isLoading ? (
        <ActivityIndicator size="small" color={color || "#6B7280"} />
      ) : (
        <Ionicons name="refresh" size={size} color={color || "#6B7280"} />
      )}
    </TouchableOpacity>
  );
}
