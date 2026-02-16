import React, { useMemo, useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import BottomSheet, { BottomSheetOption } from "@/components/BottomSheet";
import { TITLES } from "@/constants/constants";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useConversationFavorites } from "@/hooks/useConversationFavorites";
import { getCriteria } from "@/utils/conversationUtils";
import { useDeleteConversationByIdMutation, useUnblockUserMutation } from "@/query/delete/queries";
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
import { useToggleMuteConversation } from "@/hooks/useToggleMuteConversation";

interface MobileConversationContextMenuProps {
  conversationId: number;
  isFavorite: boolean;
  isPinned: boolean;
  isMuted?: boolean;
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
  isMuted = false,
  isGroup = false,
  isBlocked = false,
  isActive = true,
  visible,
  onClose,
}: MobileConversationContextMenuProps) => {
  const [sheetVisible, setSheetVisible] = useState(visible);

  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);
  const { handleToggleFavorites } = useConversationFavorites(conversationId, criteria);
  const {
    user: { id: userId },
  } = useUserStore();
  const { closeModal } = useModalContext();
  const { refetch } = useConversationsQuery(getCriteria(selectedConversationType));

  const { conversationInfo: oneToOneInfo } = useOneToOneConversationInfoQuery(
    !isGroup ? conversationId : 0
  );

  const handleClose = useCallback(() => {
    setSheetVisible(false);
    onClose();
  }, [onClose]);

  const { isMutedState, handleToggleMute } = useToggleMuteConversation(
    conversationId,
    isMuted,
    handleClose
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
    }
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
    }
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
    }
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
    }
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
    }
  );

  useEffect(() => {
    setSheetVisible(visible);
  }, [visible]);

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
      {
        id: "3",
        title: isMutedState ? TITLES.UNMUTE_CONVERSATION : TITLES.MUTE_CONVERSATION,
        icon: isMutedState ? "notifications-off-outline" : "notifications-outline",
        onPress: handleToggleMute,
      },
    ];
    options.push({
      id: "4",
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
              id: "5",
              title: "Unblock User",
              icon: "person-add-outline",
              onPress: () => {
                handleClose();
                unblockUserMutation.mutate(oneToOneInfo.userView.id);
              },
            }
          : {
              id: "5",
              title: "Block User",
              icon: "person-remove-outline",
              destructive: true,
              onPress: () => {
                handleClose();
                blockUserMutation.mutate(oneToOneInfo.userView.id);
              },
            }
      );
    }
    if (isGroup && isActive) {
      options.push({
        id: "6",
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
    isMutedState,
    isGroup,
    isBlocked,
    isActive,
    oneToOneInfo,
    handleToggleFavorites,
    togglePinConversation,
    handleToggleMute,
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
      />
    </View>
  );
};

export default MobileConversationContextMenu;
