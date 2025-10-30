/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { useMemo, useCallback } from "react";
import {
  chatUserRole,
  ConversationParticipant,
  IOption,
} from "@/types/chat/types";
import { TITLES } from "@/constants/constants";
import { ToastUtils } from "@/utils/toastUtils";
import WebChatContextMenu from "@/components/WebContextMenu";

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
        ToastUtils.error("Error executing action: " + error);
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
        iconName: "shield-checkmark-outline",
        action: () =>
          handleToggleAdmin(
            participant.id,
            participant.role !== chatUserRole.ADMIN,
          ),
      },
      ...(!isCurrentUser
        ? ([
            {
              id: 2,
              name: TITLES.REMOVE_PARTICIPANT,
              iconName: "person-remove-outline",
              action: () => handleRemoveParticipant(participant.id),
              critical: true,
            },
          ] as IOption[])
        : []),
    ],
    [
      handleRemoveParticipant,
      handleToggleAdmin,
      isCurrentUser,
      participant.id,
      participant.role,
    ],
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
