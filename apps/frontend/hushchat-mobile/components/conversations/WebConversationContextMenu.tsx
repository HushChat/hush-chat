import React, { useMemo, useCallback } from "react";
import { IOption } from "@/types/chat/types";
import { TITLES } from "@/constants/constants";
import { ToastUtils } from "@/utils/toastUtils";
import WebChatContextMenu from "@/components/WebContextMenu";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { useConversationFavorites } from "@/hooks/useConversationFavorites";
import { getCriteria } from "@/utils/conversationUtils";
import { useTogglePinConversationMutation } from "@/query/post/queries";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { useUserStore } from "@/store/user/useUserStore";

interface ConversationWebChatContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  conversationId: number;
  isFavorite: boolean;
  isPinned: boolean;
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
  isPinned,
  handleArchivePress,
  handleDeletePress,
  conversationsRefetch,
}: ConversationWebChatContextMenuProps) => {
  const {
    user: { id: userId },
  } = useUserStore();

  const [isPinnedState, setIsPinnedState] = React.useState(isPinned);
  const { selectedConversationType } = useConversationStore();
  const criteria = getCriteria(selectedConversationType);
  const { handleToggleFavorites } = useConversationFavorites(conversationId, criteria);

  const togglePinConversation = useTogglePinConversationMutation(
    {
      userId: Number(userId),
      conversationId,
      criteria,
    },
    () => {
      setIsPinnedState(!isPinnedState);
    },
    (error) => {
      setIsPinnedState(isPinnedState);
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const handleTogglePinConversation = useCallback(() => {
    togglePinConversation.mutate(conversationId);
  }, [conversationId, togglePinConversation]);

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
            action: () => handleTogglePinConversation(),
          }
        : {
            id: 1,
            name: TITLES.PIN_CONVERSATION,
            iconName: "pin",
            action: () => handleTogglePinConversation(),
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
            action: () => handleToggleFavorites(conversationId),
          }
        : {
            id: 3,
            name: TITLES.ADD_TO_FAVOURITES,
            iconName: "heart-outline",
            action: () => handleToggleFavorites(conversationId),
          },
      {
        id: 4,
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
