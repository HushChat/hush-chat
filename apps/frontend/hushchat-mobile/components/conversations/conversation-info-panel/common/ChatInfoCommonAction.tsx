/**
 * ChatInfoCommonAction
 *
 * Shared action row used inside conversation info panels (one-to-one and group).
 */

import React, { useCallback, useEffect } from 'react';
import { View } from 'react-native';
import ActionItem from '@/components/conversations/conversation-info-panel/common/ActionItem';
import { MODAL_BUTTON_VARIANTS, MODAL_TYPES } from '@/components/Modal';
import { ToastUtils } from '@/utils/toastUtils';
import { useModalContext } from '@/context/modal-context';
import { useConversationsQuery } from '@/query/useConversationsQuery';
import { getCriteria } from '@/utils/conversationUtils';
import { useConversationStore } from '@/store/conversation/useConversationStore';
import { useConversationFavorites } from '@/hooks/useConversationFavorites';
import {
  useTogglePinConversationMutation,
  useToggleMuteConversationMutation,
} from '@/query/post/queries';
import { useDeleteConversationByIdMutation } from '@/query/delete/queries';
import { useUserStore } from '@/store/user/useUserStore';
import { getAPIErrorMsg } from '@/utils/commonUtils';

type ChatInfoActionProps = {
  conversationId: number;
  isFavorite: boolean;
  isPinned: boolean;
  isMuted: boolean;
  onBack: () => void;
  setSelectedConversation: (conversation: null) => void;
};

export default function ChatInfoCommonAction({
  conversationId,
  isFavorite,
  isPinned,
  isMuted,
  onBack,
  setSelectedConversation,
}: ChatInfoActionProps) {
  const { openModal, closeModal } = useModalContext();
  const [isFavoriteState, setIsFavoriteState] = React.useState(isFavorite);
  const [isPinnedState, setIsPinnedState] = React.useState(isPinned);
  const [isMutedState, setIsMutedState] = React.useState(isMuted);
  const { selectedConversationType } = useConversationStore();
  const { refetch } = useConversationsQuery(getCriteria(selectedConversationType));
  const {
    user: { id: userId },
  } = useUserStore();
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
    },
  );

  const toggleMuteConversation = useToggleMuteConversationMutation(
    { userId: Number(userId), criteria },
    () => setIsMutedState(!isMutedState),
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    },
  );

  useEffect(() => {
    setIsFavoriteState(isFavorite);
    setIsMutedState(isMuted);
  }, [isFavorite, isMuted]);

  const handleToggleFavorite = async () => {
    await handleToggleFavorites(conversationId);
    setIsFavoriteState(!isFavoriteState);
  };

  const handleTogglePinConversation = useCallback(() => {
    togglePinConversation.mutate(conversationId);
  }, [conversationId, togglePinConversation]);

  const MUTE_OPTIONS = [
    { label: '15 mins', value: '15m' },
    { label: '1 hour', value: '1h' },
    { label: '1 day', value: '1d' },
    { label: 'Always', value: 'always' },
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
      title: 'Mute Conversation',
      description: 'Select how long you want to mute this conversation',
      buttons: [
        ...MUTE_OPTIONS.map((option) => ({
          text: option.label,
          onPress: () => {
            performMuteMutation({ conversationId, duration: option.value });
            closeModal();
          },
        })),
        { text: 'Cancel', onPress: closeModal, variant: MODAL_BUTTON_VARIANTS.destructive },
      ],
      icon: 'volume-off-outline',
    });
  }, [isMutedState, openModal, MUTE_OPTIONS, closeModal, performMuteMutation, conversationId]);

  const deleteConversation = useDeleteConversationByIdMutation(
    {
      userId: Number(userId),
      criteria,
    },
    () => {
      ToastUtils.success('Conversation deleted successfully!');
      closeModal();
      setSelectedConversation(null);
      refetch();
      onBack();
    },
    (error) => {
      ToastUtils.error(error as string);
    },
  );

  const handleDeleteConversation = useCallback(() => {
    openModal({
      type: MODAL_TYPES.confirm,
      title: 'Delete Conversation?',
      description: 'Are you sure you want to delete this conversation?',
      buttons: [
        { text: 'Cancel', onPress: closeModal },
        {
          text: 'Delete',
          onPress: () => {
            deleteConversation.mutate(conversationId);
          },
          variant: MODAL_BUTTON_VARIANTS.destructive,
        },
      ],
      icon: 'trash-bin',
    });
  }, [openModal, closeModal, deleteConversation, conversationId]);

  return (
    <View>
      <ActionItem
        icon={isPinnedState ? 'pin-outline' : 'pin'}
        label={isPinnedState ? 'Unpin Conversation' : 'Pin Conversation'}
        onPress={handleTogglePinConversation}
      />
      <ActionItem
        icon={isFavoriteState ? 'heart' : 'heart-outline'}
        label={isFavoriteState ? 'Remove from Favorites' : 'Add to Favorites'}
        onPress={handleToggleFavorite}
      />
      <ActionItem
        icon={isMutedState ? 'notifications-off-outline' : 'notifications-outline'}
        label={isMutedState ? 'Unmute Conversation' : 'Mute Conversation'}
        onPress={handleToggleMuteConversation}
      />
      <ActionItem
        icon={'trash-bin-outline'}
        label={'Delete Conversation'}
        onPress={handleDeleteConversation}
        color="#EF4444"
      />
    </View>
  );
}
