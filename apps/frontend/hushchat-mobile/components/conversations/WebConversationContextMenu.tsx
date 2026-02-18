import React, { useMemo, useCallback } from "react";
import { IOption } from "@/types/chat/types";
import { TITLES } from "@/constants/constants";
import { ToastUtils } from "@/utils/toastUtils";
import WebChatContextMenu from "@/components/WebContextMenu";
import { useCommonConversationInfoActions } from "@/hooks/conversation-info/useCommonConversationInfoActions";
import { useToggleMuteConversation } from "@/hooks/useToggleMuteConversation";

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

  const { isMutedState, handleToggleMute } = useToggleMuteConversation(
    conversationId,
    initialMuted,
    onClose
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
