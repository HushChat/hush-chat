/**
 * ChatInfoCommonAction
 *
 * Shared action row used inside conversation info panels (one-to-one and group).
 */

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";
import { ToastUtils } from "@/utils/toastUtils";
import { useModalContext } from "@/context/modal-context";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { getCriteria } from "@/utils/conversationUtils";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useToggleMuteConversationMutation } from "@/query/post/queries";
import { useUserStore } from "@/store/user/useUserStore";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import ActionList from "@/components/conversations/conversation-info-panel/common/ActionList";
import { IActionConfig } from "@/types/chat/types";
import { useCommonConversationInfoActions } from "@/hooks/conversation-info/useCommonConversationInfoActions";

type TChatInfoActionProps = {
  conversationId: number;
  isFavorite: boolean;
  isPinned: boolean;
  isMuted: boolean;
  onBack: () => void;
  setSelectedConversation?: (conversation: null) => void;
  onShowMediaAttachments?: () => void;
};

export default function ChatInfoCommonAction({
  conversationId,
  isFavorite: initialFavorite,
  isPinned: initialPinned,
  isMuted,
  onBack,
  setSelectedConversation = () => {},
  onShowMediaAttachments,
}: TChatInfoActionProps) {
  const { openModal, closeModal } = useModalContext();
  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);
  const [isMutedState, setIsMutedState] = useState(isMuted);

  const { refetch } = useConversationsQuery(criteria);
  const {
    user: { id: userId },
  } = useUserStore();

  const { isPinned, isFavorite, togglePin, toggleFavorite, deleteConversation } =
    useCommonConversationInfoActions({
      conversationId,
      initialPinned,
      initialFavorite,
      onDeleteSuccess: () => {
        closeModal();
        setSelectedConversation(null);
        refetch();
        onBack();
      },
    });

  const toggleMuteConversation = useToggleMuteConversationMutation(
    { userId: Number(userId), criteria },
    () => setIsMutedState(!isMutedState),
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const handleShowMediaAttachments = onShowMediaAttachments || (() => {});

  useEffect(() => {
    setIsMutedState(isMuted);
  }, [isMuted]);

  const MUTE_OPTIONS = [
    { label: "15 mins", value: "15m" },
    { label: "1 hour", value: "1h" },
    { label: "1 day", value: "1d" },
    { label: "Always", value: "always" },
  ];

  const performMuteMutation = (payload: { conversationId: number; duration: string | null }) =>
    toggleMuteConversation.mutate(payload, {
      onSuccess: () => setIsMutedState(payload.duration !== null),
      onError: (error) => ToastUtils.error(getAPIErrorMsg(error)),
    });

  const handleToggleMuteConversation = useCallback(() => {
    if (isMutedState) {
      performMuteMutation({ conversationId, duration: null });
      return;
    }

    openModal({
      type: MODAL_TYPES.confirm,
      title: "Mute Conversation",
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
  }, [isMutedState, openModal, MUTE_OPTIONS, closeModal, performMuteMutation, conversationId]);

  const handleDeleteConversation = useCallback(() => {
    openModal({
      type: MODAL_TYPES.confirm,
      title: "Delete Conversation?",
      description: "Are you sure you want to delete this conversation?",
      buttons: [
        { text: "Cancel", onPress: closeModal },
        {
          text: "Delete",
          onPress: deleteConversation,
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: "trash-bin",
    });
  }, [openModal, closeModal, deleteConversation]);

  const actions: IActionConfig[] = useMemo(
    () => [
      {
        label: "All Media files",
        icon: "images-outline",
        onPress: handleShowMediaAttachments,
      },
      {
        label: isPinned ? "Unpin" : "Pin",
        icon: isPinned ? "pin-outline" : "pin",
        onPress: togglePin,
      },
      {
        label: isFavorite ? "Remove from Favorites" : "Add to Favorites",
        icon: isFavorite ? "heart" : "heart-outline",
        onPress: toggleFavorite,
      },
      {
        label: isMutedState ? "Unmute Conversation" : "Mute Conversation",
        icon: isMutedState ? "notifications-off-outline" : "notifications-outline",
        onPress: handleToggleMuteConversation,
      },
      {
        label: "Delete Conversation",
        icon: "trash-bin-outline",
        onPress: handleDeleteConversation,
      },
    ],
    [
      isPinned,
      isFavorite,
      isMutedState,
      handleDeleteConversation,
      togglePin,
      toggleFavorite,
      handleToggleMuteConversation,
      onShowMediaAttachments,
    ]
  );

  return (
    <View>
      <ActionList actions={actions} />
    </View>
  );
}
