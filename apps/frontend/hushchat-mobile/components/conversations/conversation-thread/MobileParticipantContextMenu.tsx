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

import React, { useMemo, useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import BottomSheet, { BottomSheetOption } from "@/components/BottomSheet";
import { TITLES } from "@/constants/constants";
import { ToastUtils } from "@/utils/toastUtils";
import { chatUserRole, ConversationParticipant } from "@/types/chat/types";

interface MobileParticipantContextMenuProps {
  visible: boolean;
  onClose: () => void;
  participant: ConversationParticipant;
  isCurrentUser: boolean;
  handleToggleAdmin: (participantId: number, isAdmin: boolean) => void;
  handleRemoveParticipant: (participantId: number) => void;
}

const MobileParticipantContextMenu = ({
  visible,
  onClose,
  participant,
  isCurrentUser,
  handleToggleAdmin,
  handleRemoveParticipant,
}: MobileParticipantContextMenuProps) => {
  const [sheetVisible, setSheetVisible] = useState(visible);

  useEffect(() => {
    setSheetVisible(visible);
  }, [visible]);

  const handleClose = useCallback(() => {
    setSheetVisible(false);
    onClose();
  }, [onClose]);

  const handleOptionPress = useCallback(
    async (action: () => Promise<void> | void) => {
      try {
        await action();
      } catch (error) {
        ToastUtils.error("Error executing action: " + error);
      } finally {
        handleClose();
      }
    },
    [handleClose],
  );

  const participantOptions: BottomSheetOption[] = useMemo(() => {
    const options: BottomSheetOption[] = [
      {
        id: "1",
        title: TITLES.TOGGLE_ROLE(participant.role),
        icon: "shield-checkmark-outline",
        onPress: () =>
          handleOptionPress(() =>
            handleToggleAdmin(
              participant.id,
              participant.role !== chatUserRole.ADMIN,
            ),
          ),
      },
    ];

    if (!isCurrentUser) {
      options.push({
        id: "2",
        title: TITLES.REMOVE_PARTICIPANT,
        icon: "person-remove-outline",
        destructive: true,
        onPress: () =>
          handleOptionPress(() => handleRemoveParticipant(participant.id)),
      });
    }

    return options;
  }, [
    participant.id,
    participant.role,
    isCurrentUser,
    handleToggleAdmin,
    handleRemoveParticipant,
    handleOptionPress,
  ]);

  return (
    <View>
      <BottomSheet
        visible={sheetVisible}
        onClose={handleClose}
        title="Participant Options"
        options={participantOptions}
        showBorders={false}
      />
    </View>
  );
};

export default MobileParticipantContextMenu;
