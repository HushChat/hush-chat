import { useMemo, useState } from 'react';
import { useConversationStore } from '@/store/conversation/useConversationStore';
import { useForwardMessageMutation } from '@/query/patch/queries';
import { ToastUtils } from '@/utils/toastUtils';
import { TConversation } from '@/components/ConversationsMultiSelect';
import { EMPTY_SET } from '@/constants/constants';
import { useUserStore } from '@/store/user/useUserStore';
import { getCriteria } from '@/utils/conversationUtils';

export const useForwardMessageHandler = (onSuccess?: () => void) => {
  const { selectedMessageIds, setSelectionMode, setSelectedMessageIds, selectedConversationType } =
    useConversationStore();
  const [selectedConversations, setSelectedConversations] = useState<TConversation[]>([]);
  const [customText, setCustomText] = useState<string>('');
  const {
    user: { id: userId },
  } = useUserStore();
  const criteria = getCriteria(selectedConversationType);

  const selectedCount = selectedMessageIds.size;

  const resetSelection = () => {
    setSelectionMode(false);
    setSelectedMessageIds(EMPTY_SET);
  };

  const { mutate: forwardMessage, isPending } = useForwardMessageMutation(
    {
      userId: userId,
      criteria: criteria,
    },
    () => {
      resetSelection();
      onSuccess?.();
    },
    () => {
      ToastUtils.error(`Failed to forward message${selectedCount > 1 ? 's' : ''}`);
    },
  );

  const handleSend = () => {
    forwardMessage({
      forwardedMessageIds: Array.from(selectedMessageIds),
      conversationIds: selectedConversations.map((conversation) => Number(conversation.id)),
      customText: customText,
    });
  };

  const canSend = useMemo(
    () => selectedCount > 0 && selectedConversations.length > 0 && !isPending,
    [selectedCount, selectedConversations.length, isPending],
  );

  return {
    selectedConversations,
    setSelectedConversations,
    customText,
    setCustomText,
    selectedCount,
    isPending,
    canSend,
    resetSelection,
    handleSend,
  };
};
