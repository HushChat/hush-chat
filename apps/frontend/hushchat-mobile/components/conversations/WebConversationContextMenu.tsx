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

import React, { useMemo, useCallback } from "react";
import { IOption } from "@/types/chat/types";
import { TITLES } from "@/constants/constants";
import { ToastUtils } from "@/utils/toastUtils";
import WebChatContextMenu from "@/components/WebContextMenu";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useConversationFavorites } from "@/hooks/useConversationFavorites";
import { getCriteria } from "@/utils/conversationUtils";

interface ConversationWebChatContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  conversationId: number;
  isFavorite: boolean;
  handleArchivePress: (conversationId: number) => void;
  handleDeletePress: (conversationId: number) => void;
  conversationsRefetch: () => void;
}

const ConversationWebChatContextMenu = ({
  visible,
  position,
  onClose,
  conversationId,
  isFavorite,
  handleArchivePress,
  handleDeletePress,
  conversationsRefetch,
}: ConversationWebChatContextMenuProps) => {
  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);
  const { handleToggleFavorites } = useConversationFavorites(
    conversationId,
    criteria,
  );

  const handleOptionSelect = useCallback(
    async (action: () => Promise<void> | void) => {
      try {
        await action();
        conversationsRefetch();
      } catch (error) {
        ToastUtils.error("Error executing action: " + error);
      } finally {
        onClose();
      }
    },
    [conversationsRefetch, onClose],
  );

  const chatOptions: IOption[] = useMemo(
    () => [
      {
        id: 1,
        name: TITLES.ARCHIVE_CHAT(selectedConversationType),
        iconName: "archive-outline",
        action: () => handleArchivePress(conversationId),
      },
      isFavorite
        ? {
            id: 2,
            name: TITLES.REMOVE_FROM_FAVOURITES,
            iconName: "heart",
            action: () => handleToggleFavorites(conversationId),
          }
        : {
            id: 2,
            name: TITLES.ADD_TO_FAVOURITES,
            iconName: "heart-outline",
            action: () => handleToggleFavorites(conversationId),
          },
      {
        id: 3,
        name: TITLES.DELETE_CHAT,
        iconName: "trash-outline",
        action: () => handleDeletePress(conversationId),
        critical: true,
      },
    ],
    [
      selectedConversationType,
      isFavorite,
      handleArchivePress,
      conversationId,
      handleToggleFavorites,
      handleDeletePress,
    ],
  );

  return (
    <WebChatContextMenu
      visible={visible}
      position={position}
      onClose={onClose}
      options={chatOptions}
      onOptionSelect={handleOptionSelect}
    />
  );
};

export default ConversationWebChatContextMenu;
