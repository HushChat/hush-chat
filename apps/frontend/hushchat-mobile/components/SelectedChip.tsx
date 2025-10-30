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
import { DEFAULT_HIT_SLOP } from "@/constants/ui";
import { PLATFORM } from "@/constants/platformConstants";

interface SelectedChipProps {
  label: string;
  onRemove: () => void;
}

export const SelectedChip = ({ label, onRemove }: SelectedChipProps) => (
  <View
    className={`flex-row items-center bg-primary-light dark:bg-primary-dark/50 ${
      PLATFORM.IS_WEB ? "px-3 py-1.5 mr-2 mb-3" : "px-3 py-2 mr-2 mb-2"
    } rounded-full`}
  >
    <Text
      className={`text-white text-sm font-medium ${PLATFORM.IS_WEB ? "mr-1.5" : "mr-2"}`}
    >
      {label}
    </Text>
    <TouchableOpacity onPress={onRemove} hitSlop={DEFAULT_HIT_SLOP}>
      <Ionicons
        name="close-circle"
        size={PLATFORM.IS_WEB ? 14 : 16}
        color="white"
      />
    </TouchableOpacity>
  </View>
);
