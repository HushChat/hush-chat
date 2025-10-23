import React, { useMemo, useCallback } from 'react';
import { IOption } from '@/types/chat/types';
import { TITLES } from '@/constants/constants';
import { ToastUtils } from '@/utils/toastUtils';
import WebChatContextMenu from '@/components/WebContextMenu';
import { useConversationStore } from '@/store/conversation/useConversationStore';
import { useConversationFavorites } from '@/hooks/useConversationFavorites';
import { getCriteria } from '@/utils/conversationUtils';

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
  const { handleToggleFavorites } = useConversationFavorites(conversationId, criteria);

  const handleOptionSelect = useCallback(
    async (action: () => Promise<void> | void) => {
      try {
        await action();
        conversationsRefetch();
      } catch (error) {
        ToastUtils.error('Error executing action: ' + error);
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
        iconName: 'archive-outline',
        action: () => handleArchivePress(conversationId),
      },
      isFavorite
        ? {
            id: 2,
            name: TITLES.REMOVE_FROM_FAVOURITES,
            iconName: 'heart',
            action: () => handleToggleFavorites(conversationId),
          }
        : {
            id: 2,
            name: TITLES.ADD_TO_FAVOURITES,
            iconName: 'heart-outline',
            action: () => handleToggleFavorites(conversationId),
          },
      {
        id: 3,
        name: TITLES.DELETE_CHAT,
        iconName: 'trash-outline',
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
