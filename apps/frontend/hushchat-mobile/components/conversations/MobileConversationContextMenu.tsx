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

import React, { useMemo, useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import BottomSheet, { BottomSheetOption } from "@/components/BottomSheet";
import { TITLES } from "@/constants/constants";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useConversationFavorites } from "@/hooks/useConversationFavorites";
import { getCriteria } from "@/utils/conversationUtils";
import {
  useDeleteConversationByIdMutation,
  useUnblockUserMutation,
} from "@/query/delete/queries";
import { useUserStore } from "@/store/user/useUserStore";
import { ToastUtils } from "@/utils/toastUtils";
import { useModalContext } from "@/context/modal-context";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import {
  useBlockUserMutation,
  useTogglePinConversationMutation,
  useExitGroupConversationMutation,
} from "@/query/post/queries";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { useOneToOneConversationInfoQuery } from "@/query/useOneToOneConversationInfoQuery";

interface MobileConversationContextMenuProps {
  conversationId: number;
  isFavorite: boolean;
  isPinned: boolean;
  visible: boolean;
  isGroup?: boolean;
  isBlocked?: boolean;
  isActive?: boolean;
  onClose: () => void;
}

const MobileConversationContextMenu = ({
  conversationId,
  isFavorite,
  isPinned,
  isGroup = false,
  isBlocked = false,
  isActive = true,
  visible,
  onClose,
}: MobileConversationContextMenuProps) => {
  const [sheetVisible, setSheetVisible] = useState(visible);

  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);
  const { handleToggleFavorites } = useConversationFavorites(
    conversationId,
    criteria,
  );
  const {
    user: { id: userId },
  } = useUserStore();
  const { closeModal } = useModalContext();
  const { refetch } = useConversationsQuery(
    getCriteria(selectedConversationType),
  );

  const { conversationInfo: oneToOneInfo } = useOneToOneConversationInfoQuery(
    !isGroup ? conversationId : 0,
  );

  const togglePinConversation = useTogglePinConversationMutation(
    {
      userId: Number(userId),
      conversationId,
      criteria,
    },
    () => {
      refetch();
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    },
  );

  const deleteConversation = useDeleteConversationByIdMutation(
    {
      userId: Number(userId),
      criteria,
    },
    () => {
      ToastUtils.success("Conversation deleted successfully!");
      closeModal();
      refetch();
    },
    (error) => {
      ToastUtils.error(error as string);
    },
  );

  const blockUserMutation = useBlockUserMutation(
    { userId: Number(userId), conversationId, criteria },
    () => {
      ToastUtils.success("User blocked successfully");
      refetch();
      closeModal();
      handleClose();
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    },
  );

  const unblockUserMutation = useUnblockUserMutation(
    { userId: Number(userId), conversationId },
    () => {
      ToastUtils.success("User unblocked successfully");
      refetch();
      closeModal();
      handleClose();
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    },
  );

  const exitGroupMutation = useExitGroupConversationMutation(
    { userId: Number(userId), conversationId },
    () => {
      ToastUtils.success("You have exited the group");
      refetch();
      closeModal();
      handleClose();
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    },
  );

  useEffect(() => {
    setSheetVisible(visible);
  }, [visible]);

  const handleClose = useCallback(() => {
    setSheetVisible(false);
    onClose();
  }, [onClose]);

  const chatOptions: BottomSheetOption[] = useMemo(() => {
    const options: BottomSheetOption[] = [
      isPinned
        ? {
            id: "1",
            title: "Unpin Conversation",
            icon: "pin-outline",
            onPress: async () => {
              try {
                togglePinConversation.mutate(conversationId);
              } finally {
                handleClose();
              }
            },
          }
        : {
            id: "1",
            title: "Pin Conversation",
            icon: "pin",
            onPress: async () => {
              try {
                togglePinConversation.mutate(conversationId);
              } finally {
                handleClose();
              }
            },
          },
      isFavorite
        ? {
            id: "2",
            title: TITLES.REMOVE_FROM_FAVOURITES,
            icon: "heart",
            onPress: async () => {
              try {
                await handleToggleFavorites(conversationId);
              } finally {
                handleClose();
              }
            },
          }
        : {
            id: "2",
            title: TITLES.ADD_TO_FAVOURITES,
            icon: "heart-outline",
            onPress: async () => {
              try {
                await handleToggleFavorites(conversationId);
              } finally {
                handleClose();
              }
            },
          },
    ];
    options.push({
      id: "3",
      title: TITLES.DELETE_CHAT,
      icon: "trash-outline",
      destructive: true,
      onPress: () => {
        handleClose();
        deleteConversation.mutate(conversationId);
      },
    });
    if (!isGroup && oneToOneInfo?.userView) {
      options.push(
        isBlocked
          ? {
              id: "4",
              title: "Unblock User",
              icon: "person-add-outline",
              onPress: () => {
                handleClose();
                unblockUserMutation.mutate(oneToOneInfo.userView.id);
              },
            }
          : {
              id: "4",
              title: "Block User",
              icon: "person-remove-outline",
              destructive: true,
              onPress: () => {
                handleClose();
                blockUserMutation.mutate(oneToOneInfo.userView.id);
              },
            },
      );
    }
    if (isGroup && isActive) {
      options.push({
        id: "5",
        title: "Exit Group",
        icon: "exit-outline",
        destructive: true,
        onPress: () => {
          handleClose();
          exitGroupMutation.mutate(conversationId);
        },
      });
    }

    return options;
  }, [
    conversationId,
    isFavorite,
    isPinned,
    isGroup,
    isBlocked,
    isActive,
    oneToOneInfo,
    handleToggleFavorites,
    togglePinConversation,
    handleClose,
    blockUserMutation,
    unblockUserMutation,
    exitGroupMutation,
    deleteConversation,
  ]);

  return (
    <View>
      <BottomSheet
        visible={sheetVisible}
        onClose={handleClose}
        title="More Options"
        options={chatOptions}
        showBorders={false}
      />
    </View>
  );
};

export default MobileConversationContextMenu;
