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

import React, { useCallback } from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";
import RefreshButton from "@/components/RefreshButton";
import { DEFAULT_ACTIVE_OPACITY, DEFAULT_HIT_SLOP } from "@/constants/ui";
import { PLATFORM } from "@/constants/platformConstants";
import { handleConversationNavigation } from "@/utils/commonUtils";
import { ConversationInfo } from "@/types/chat/types";
import { AppText } from "@/components/AppText";

interface ChatHeaderProps {
  conversationInfo: ConversationInfo;
  onBackPress?: () => void;
  onShowProfile: () => void;
  refetchConversationMessages: () => void;
  isLoadingConversationMessages: boolean;
  webPressSearch?: () => void;
}

const ChatHeader = ({
  conversationInfo,
  onBackPress,
  onShowProfile,
  refetchConversationMessages,
  isLoadingConversationMessages,
  webPressSearch,
}: ChatHeaderProps) => {
  const handleProfileNavigate = useCallback(() => {
    handleConversationNavigation(
      onShowProfile,
      conversationInfo.conversationId,
    );
  }, [onShowProfile, conversationInfo.conversationId]);

  return (
    <View className="bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 px-4 py-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3 flex-1">
          {!PLATFORM.IS_WEB && (
            <TouchableOpacity onPress={onBackPress} hitSlop={DEFAULT_HIT_SLOP}>
              <Ionicons
                name="arrow-back-outline"
                size={20}
                className="!text-text-primary-light dark:!text-text-primary-dark"
              />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={handleProfileNavigate}
            className="flex-row items-center gap-3 flex-1"
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
          >
            <InitialsAvatar
              name={conversationInfo.conversationName}
              size={AvatarSize.small}
              imageUrl={conversationInfo.signedImageUrl}
            />
            <AppText
              className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark flex-1"
              numberOfLines={1}
            >
              {conversationInfo.conversationName}
            </AppText>
          </TouchableOpacity>
        </View>

        {PLATFORM.IS_WEB && (
          <View className="flex-row items-center gap-1">
            <TouchableOpacity
              className="rounded-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 active:bg-gray-200 dark:active:bg-gray-600"
              onPress={webPressSearch}
            >
              <Ionicons name="search" size={20} color={"#6B7280"} />
            </TouchableOpacity>
            <RefreshButton
              onRefresh={refetchConversationMessages}
              isLoading={isLoadingConversationMessages}
            />
          </View>
        )}
      </View>
    </View>
  );
};

export default ChatHeader;
