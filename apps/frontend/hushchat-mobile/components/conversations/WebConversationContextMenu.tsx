import React, { useMemo, useCallback, useState, useEffect } from "react";
import { IOption } from "@/types/chat/types";
import { TITLES } from "@/constants/constants";
import { ToastUtils } from "@/utils/toastUtils";
import WebChatContextMenu from "@/components/WebContextMenu";
import { useCommonConversationInfoActions } from "@/hooks/conversation-info/useCommonConversationInfoActions";
import { useToggleMuteConversationMutation } from "@/query/post/queries";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";
import { useModalContext } from "@/context/modal-context";
import { useUserStore } from "@/store/user/useUserStore";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { getCriteria } from "@/utils/conversationUtils";
import { getAPIErrorMsg } from "@/utils/commonUtils";

interface ConversationWebChatContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  conversationId: number;
  isFavorite: boolean;
  isPinned: boolean;
  isMuted: boolean;
  handleArchivePress: (conversationId: number) => void;
  handleDeletePress: (conversationId: number) => void;
  conversationsRefetch: () => void;
}

const MUTE_OPTIONS = [
  { label: "15 mins", value: "15m" },
  { label: "1 hour", value: "1h" },
  { label: "1 day", value: "1d" },
  { label: "Always", value: "always" },
];

const ConversationWebChatContextMenu = ({
  visible,
  position,
  onClose,
  conversationId,
  isFavorite: initialFavorite,
  isPinned: initialPinned,
  isMuted: initialMuted,
  handleArchivePress,
  handleDeletePress,
  conversationsRefetch,
}: ConversationWebChatContextMenuProps) => {
  const { isPinned, isFavorite, togglePin, toggleFavorite, selectedConversationType } =
    useCommonConversationInfoActions({
      conversationId,
      initialPinned,
      initialFavorite,
    });

  const [isMutedState, setIsMutedState] = useState(initialMuted);
  const { openModal, closeModal } = useModalContext();
  const {
    user: { id: userId },
  } = useUserStore();
  const { selectedConversationType: storeConversationType } = useConversationStore();
  const criteria = getCriteria(storeConversationType);

  const toggleMuteConversation = useToggleMuteConversationMutation(
    { userId: Number(userId), criteria },
    () => setIsMutedState(!isMutedState),
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  useEffect(() => {
    setIsMutedState(initialMuted);
  }, [initialMuted]);

  const performMuteMutation = useCallback(
    (payload: { conversationId: number; duration: string | null }) =>
      toggleMuteConversation.mutate(payload, {
        onSuccess: () => {
          setIsMutedState(payload.duration !== null);
          conversationsRefetch();
        },
        onError: (error) => ToastUtils.error(getAPIErrorMsg(error)),
      }),
    [toggleMuteConversation, conversationsRefetch]
  );

  const handleToggleMute = useCallback(() => {
    onClose();
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
  }, [isMutedState, openModal, closeModal, performMuteMutation, conversationId, onClose]);

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
    [conversationsRefetch, onClose]
  );

  const chatOptions: IOption[] = useMemo(
    () => [
      isPinned
        ? {
            id: 1,
            name: TITLES.UNPIN_CONVERSATION,
            iconName: "pin-outline",
            action: togglePin,
          }
        : {
            id: 1,
            name: TITLES.PIN_CONVERSATION,
            iconName: "pin",
            action: togglePin,
          },
      {
        id: 2,
        name: TITLES.ARCHIVE_CHAT(selectedConversationType),
        iconName: "archive-outline",
        action: () => handleArchivePress(conversationId),
      },
      isFavorite
        ? {
            id: 3,
            name: TITLES.REMOVE_FROM_FAVOURITES,
            iconName: "heart",
            action: toggleFavorite,
          }
        : {
            id: 3,
            name: TITLES.ADD_TO_FAVOURITES,
            iconName: "heart-outline",
            action: toggleFavorite,
          },
      {
        id: 4,
        name: isMutedState ? TITLES.UNMUTE_CONVERSATION : TITLES.MUTE_CONVERSATION,
        iconName: isMutedState ? "notifications-off-outline" : "notifications-outline",
        action: handleToggleMute,
      },
      {
        id: 5,
        name: TITLES.DELETE_CHAT,
        iconName: "trash-outline",
        action: () => handleDeletePress(conversationId),
        critical: true,
      },
    ],
    [
      selectedConversationType,
      isFavorite,
      isPinned,
      isMutedState,
      handleArchivePress,
      conversationId,
      toggleFavorite,
      togglePin,
      handleToggleMute,
      handleDeletePress,
    ]
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
