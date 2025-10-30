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
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { IMessage } from "@/types/chat/types";
import { AppText } from "@/components/AppText";

interface ReplyPreviewProps {
  replyToMessage: IMessage;
  onCancelReply: () => void;
}

const ReplyPreview = ({ replyToMessage, onCancelReply }: ReplyPreviewProps) => {
  let previewText = "";

  if (replyToMessage.messageText?.trim()) {
    previewText = replyToMessage.messageText;
  } else if (replyToMessage.messageAttachments?.length) {
    previewText = "Replying to an attachment";
  }

  return (
    <View className="mx-4 mb-2 bg-gray-100 dark:bg-gray-800 rounded-lg border-l-4 border-primary-light dark:border-primary-dark">
      <View className="flex-row items-center justify-between p-3">
        <View className="flex-1">
          <AppText className="text-sm font-medium text-primary-light dark:text-primary-dark mb-1">
            Replying to message
          </AppText>
          <AppText
            className="text-sm text-gray-700 dark:text-gray-300"
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {previewText}
          </AppText>
        </View>
        <Pressable
          onPress={onCancelReply}
          className="ml-2 p-1"
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="close" size={20} color="#9CA3AF" />
        </Pressable>
      </View>
    </View>
  );
};

export default ReplyPreview;
