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
import { Ionicons } from "@expo/vector-icons";
import { PLATFORM } from "@/constants/platformConstants";
import { AppText } from "@/components/AppText";

type ChatInfoNameBarProps = {
  title: string;
  isWebView?: boolean;
  showActions?: boolean;
  onPressChat?: () => void;
  onPressCall?: () => void;
  onPressSearch?: () => void;
};

export default function ChatInfoNameBar({
  title,
  showActions = false,
  onPressChat,
  onPressCall,
  onPressSearch,
}: ChatInfoNameBarProps) {
  return (
    <View className="px-4 py-[14px] flex-row items-center justify-between">
      <AppText
        className={`font-semibold text-black dark:text-white ${PLATFORM.IS_WEB ? "text-lg" : "text-xl"}`}
        numberOfLines={1}
      >
        {title}
      </AppText>

      {showActions && !PLATFORM.IS_WEB && (
        <View className="flex-row gap-[10px]">
          <TouchableOpacity
            className="rounded-full p-[10px] bg-secondary-light dark:bg-secondary-dark"
            onPress={onPressSearch}
          >
            <Ionicons
              name="search"
              size={22}
              className="!text-primary-light dark:!text-primary-dark"
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-full p-[10px] bg-secondary-light dark:bg-secondary-dark"
            onPress={onPressChat}
          >
            <Ionicons
              name="chatbox"
              size={22}
              className="!text-primary-light dark:!text-primary-dark"
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-full p-[10px] bg-secondary-light dark:bg-secondary-dark"
            onPress={onPressCall}
          >
            <Ionicons
              name="call"
              size={22}
              className="!text-primary-light dark:!text-primary-dark"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
