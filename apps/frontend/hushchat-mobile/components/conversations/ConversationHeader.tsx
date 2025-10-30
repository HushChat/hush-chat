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
import { GestureResponderEvent, View } from "react-native";
import RefreshButton from "@/components/RefreshButton";
import KebabMenuButton from "@/components/KebabMenuButton";
import WebContextMenu from "@/components/WebContextMenu";
import { useContextMenu } from "@/hooks/useContextMenu";
import { ConversationType, IOption } from "@/types/chat/types";
import BackButton from "@/components/BackButton";
import { AppText } from "@/components/AppText";
import WebSocketStatusIndicator from "@/components/conversations/WebSocketStatusIndicator";

type TChatHeaderMenuProps = {
  onRefresh: () => void;
  isLoading: boolean;
  onCreateGroup?: () => void | Promise<void>;
  selectedConversationType: ConversationType;
  setSelectedConversationType: (newConversationType: ConversationType) => void;
};

export const ConversationHeader = ({
  onRefresh,
  isLoading,
  onCreateGroup,
  selectedConversationType,
  setSelectedConversationType,
}: TChatHeaderMenuProps) => {
  const { visible, position, openAtEvent, close } = useContextMenu();

  const options: IOption[] = [
    {
      id: 1,
      name: "New Group",
      iconName: "people-outline",
      action: () => {
        if (onCreateGroup) return onCreateGroup();
      },
    },
  ];

  const handleKebabPress = (e: GestureResponderEvent) => openAtEvent(e);

  const handleOptionSelect = async (action: () => void | Promise<void>) => {
    await action();
  };

  return (
    <View className="px-6 py-4 flex-row items-center">
      <View className="flex-row items-center flex-1">
        {selectedConversationType === ConversationType.ARCHIVED && (
          <BackButton
            onPress={() => setSelectedConversationType(ConversationType.ALL)}
          />
        )}
        <AppText className="text-2xl font-bold text-gray-900 dark:text-white">
          {selectedConversationType === ConversationType.ARCHIVED
            ? "Archived"
            : "Chats"}
        </AppText>
      </View>
      <View className="flex-row items-center gap-3">
        <WebSocketStatusIndicator />
        <RefreshButton
          onRefresh={onRefresh}
          isLoading={isLoading}
          color="#6B7280"
        />
        <KebabMenuButton onPress={handleKebabPress} />
        <WebContextMenu
          visible={visible}
          position={position}
          onClose={close}
          options={options}
          onOptionSelect={handleOptionSelect}
        />
      </View>
    </View>
  );
};
