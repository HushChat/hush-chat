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
  useToggleMuteConversationMutation,
  useExitGroupConversationMutation,
} from "@/query/post/queries";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { useOneToOneConversationInfoQuery } from "@/query/useOneToOneConversationInfoQuery";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";

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

const MUTE_OPTIONS = [
  { label: "15 mins", value: "15m" },
  { label: "1 hour", value: "1h" },
  { label: "1 day", value: "1d" },
  { label: "Always", value: "always" },
];

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
  const [isMutedState, setIsMutedState] = useState(isMuted);

  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);
  const { handleToggleFavorites } = useConversationFavorites(conversationId, criteria);
  const {
    user: { id: userId },
  } = useUserStore();
  const { openModal, closeModal } = useModalContext();
  const { refetch } = useConversationsQuery(getCriteria(selectedConversationType));

  const { conversationInfo: oneToOneInfo } = useOneToOneConversationInfoQuery(
    !isGroup ? conversationId : 0
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

  const toggleMuteConversation = useToggleMuteConversationMutation(
    { userId: Number(userId), criteria },
    () => setIsMutedState(!isMutedState),
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

  useEffect(() => {
    setIsMutedState(isMuted);
  }, [isMuted]);

  const handleClose = useCallback(() => {
    setSheetVisible(false);
    onClose();
  }, [onClose]);

  const performMuteMutation = useCallback(
    (payload: { conversationId: number; duration: string | null }) =>
      toggleMuteConversation.mutate(payload, {
        onSuccess: () => {
          setIsMutedState(payload.duration !== null);
          refetch();
        },
        onError: (error) => ToastUtils.error(getAPIErrorMsg(error)),
      }),
    [toggleMuteConversation, refetch]
  );

  const handleToggleMute = useCallback(() => {
    handleClose();
    if (isMutedState) {
      performMuteMutation({ conversationId, duration: null });
      return;
    }

    openModal({
      type: MODAL_TYPES.confirm,
      title: TITLES.MUTE_CONVERSATION,
      description: "Select how long you want to mute this conversation",
      buttons: [
        ...MUTE_OPTIONS.map((option) => ({
          text: option.label,
          onPress: () => {
            performMuteMutation({ conversationId, duration: option.value });
            closeModal();
          },
        })),
        {
          text: "Cancel",
          onPress: closeModal,
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: "volume-off-outline",
    });
  }, [isMutedState, handleClose, openModal, closeModal, performMuteMutation, conversationId]);

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
