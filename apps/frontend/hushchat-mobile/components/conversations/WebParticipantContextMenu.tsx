import React, { useMemo, useCallback } from 'react';
import { chatUserRole, ConversationParticipant, IOption } from '@/types/chat/types';
import { TITLES } from '@/constants/constants';
import { ToastUtils } from '@/utils/toastUtils';
import WebChatContextMenu from '@/components/WebContextMenu';

interface WebParticipantContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  participant: ConversationParticipant;
  isCurrentUser: boolean;
  handleToggleAdmin: (participantId: number, isAdmin: boolean) => void;
  handleRemoveParticipant: (participantId: number) => void;
}

const WebParticipantContextMenu = ({
  visible,
  position,
  onClose,
  participant,
  isCurrentUser,
  handleToggleAdmin,
  handleRemoveParticipant,
}: WebParticipantContextMenuProps) => {
  const handleOptionSelect = useCallback(
    async (action: () => Promise<void> | void) => {
      try {
        await action();
      } catch (error) {
        ToastUtils.error('Error executing action: ' + error);
      } finally {
        onClose();
      }
    },
    [onClose],
  );

  const participantOptions: IOption[] = useMemo(
    () => [
      {
        id: 1,
        name: TITLES.TOGGLE_ROLE(participant.role),
        iconName: 'shield-checkmark-outline',
        action: () => handleToggleAdmin(participant.id, participant.role !== chatUserRole.ADMIN),
      },
      ...(!isCurrentUser
        ? ([
            {
              id: 2,
              name: TITLES.REMOVE_PARTICIPANT,
              iconName: 'person-remove-outline',
              action: () => handleRemoveParticipant(participant.id),
              critical: true,
            },
          ] as IOption[])
        : []),
    ],
    [handleRemoveParticipant, handleToggleAdmin, isCurrentUser, participant.id, participant.role],
  );

  return (
    <WebChatContextMenu
      visible={visible}
      position={position}
      onClose={onClose}
      options={participantOptions}
      onOptionSelect={handleOptionSelect}
    />
  );
};

export default WebParticipantContextMenu;
