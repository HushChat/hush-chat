/**
 * ChatInfoCommonAction
 *
 * Shared action row used inside conversation info panels (one-to-one and group).
 */

import React, { useCallback, useMemo } from "react";
import { View } from "react-native";
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from "@/components/Modal";
import { useModalContext } from "@/context/modal-context";
import { useConversationsQuery } from "@/query/useConversationsQuery";
import { getCriteria } from "@/utils/conversationUtils";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import ActionList from "@/components/conversations/conversation-info-panel/common/ActionList";
import { IActionConfig } from "@/types/chat/types";
import { useCommonConversationInfoActions } from "@/hooks/conversation-info/useCommonConversationInfoActions";
import { useToggleMuteConversation } from "@/hooks/useToggleMuteConversation";
import { router } from "expo-router";

type TChatInfoActionProps = {
  conversationId: number;
  isFavorite: boolean;
  isPinned: boolean;
  isMuted: boolean;
  onBack: () => void;
  onShowMediaAttachments?: () => void;
};

export default function ChatInfoCommonAction({
  conversationId,
  isFavorite: initialFavorite,
  isPinned: initialPinned,
  isMuted,
  onBack,
  onShowMediaAttachments,
}: TChatInfoActionProps) {
  const { openModal, closeModal } = useModalContext();
  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);

  const { refetch } = useConversationsQuery(criteria);

  const { isPinned, isFavorite, togglePin, toggleFavorite, deleteConversation } =
    useCommonConversationInfoActions({
      conversationId,
      initialPinned,
      initialFavorite,
      onDeleteSuccess: () => {
        closeModal();
        router.push("/");
        refetch();
        onBack();
      },
    });

  const { isMutedState, handleToggleMute: handleToggleMuteConversation } =
    useToggleMuteConversation(conversationId, isMuted);

  const handleShowMediaAttachments = onShowMediaAttachments || (() => {});

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
