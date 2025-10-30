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

import { View, TouchableOpacity, GestureResponderEvent } from "react-native";
import React, { RefObject } from "react";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

interface ChevronButtonProps {
  chevronButtonRef: RefObject<View | null>;
  handleOptionsPress: (e: GestureResponderEvent) => void;
}

const ChevronButton = ({
  chevronButtonRef,
  handleOptionsPress,
}: ChevronButtonProps) => {
  const { isDark } = useAppTheme();
  return (
    <TouchableOpacity
      ref={chevronButtonRef}
      onPress={handleOptionsPress}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      className="p-1 ml-1 opacity-0 group-hover:opacity-100"
    >
      <View className="w-4 h-4 items-center justify-center dark:bg-primary">
        <Ionicons
          name="chevron-down"
          size={20}
          color={isDark ? "#9ca3af" : "#6B7280"}
        />
      </View>
    </TouchableOpacity>
  );
};

export default ChevronButton;
