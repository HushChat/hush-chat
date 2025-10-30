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
import { DEFAULT_HIT_SLOP } from "@/constants/ui";
import { IMessage, ConversationAPIResponse } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import { AppText } from "@/components/AppText";

interface ActionsHeaderProps {
  message: IMessage;
  conversation?: ConversationAPIResponse;
  onClose: () => void;
  onPinToggle: (m: IMessage) => void;
  onForward: (m: IMessage) => void;
  onUnsend: (m: IMessage) => void;
}

const ActionsHeader = ({
  message,
  conversation,
  onClose,
  onPinToggle,
  onForward,
  onUnsend,
}: ActionsHeaderProps) => {
  const { user } = useUserStore();
  const isPinned = conversation?.pinnedMessage?.id === message?.id;

  return (
    <View className="absolute bottom-full !z-50 w-full bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          <TouchableOpacity onPress={onClose} hitSlop={DEFAULT_HIT_SLOP}>
            <Ionicons
              name="close-outline"
              size={22}
              className="!text-text-primary-light dark:!text-text-primary-dark"
            />
          </TouchableOpacity>

          <View className="flex-1">
            <AppText
              className="text-base font-medium text-text-primary-light dark:text-text-primary-dark"
              numberOfLines={1}
            >
              {message?.senderFirstName} {message?.senderLastName}
            </AppText>
            <AppText className="text-xs text-text-secondary-light dark:text-text-secondary-dark">
              {new Date(message?.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </AppText>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {message.senderId === Number(user.id) && !message.isUnsend && (
            <TouchableOpacity
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
              onPress={() => onUnsend(message)}
            >
              <Ionicons name={"trash-outline"} size={20} color={"#6B7280"} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
            onPress={() => onPinToggle(message)}
          >
            <Ionicons
              name={isPinned ? "pin" : "pin-outline"}
              size={20}
              color={isPinned ? "#6B4EFF" : "#6B7280"}
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
            onPress={() => onForward(message)}
          >
            <Ionicons name="arrow-redo-outline" size={20} color={"#6B7280"} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default ActionsHeader;
