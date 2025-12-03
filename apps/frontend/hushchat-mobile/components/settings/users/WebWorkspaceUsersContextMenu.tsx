import React, { useMemo, useCallback } from "react";
import { IOption } from "@/types/chat/types";
import { TITLES } from "@/constants/constants";
import { ToastUtils } from "@/utils/toastUtils";
import WebChatContextMenu from "@/components/WebContextMenu";
import { WorkspaceUser } from "@/types/user/types";

interface WebWorkspaceUsersContextMenuProps {
  visible: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  user: WorkspaceUser;
  isCurrentUser: boolean;
  handleToggleSuspend: (email: string) => void;
}

const WebWorkspaceUsersContextMenu = ({
  visible,
  position,
  onClose,
  user,
  isCurrentUser,
  handleToggleSuspend,
}: WebWorkspaceUsersContextMenuProps) => {
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
    [onClose]
  );

  const userOptions: IOption[] = useMemo(
    () => [
      ...(!isCurrentUser
        ? ([
            {
              id: 1,
              name: TITLES.TOGGLE_SUSPENSION(user.status),
              iconName: "person-remove-outline",
              action: () => handleToggleSuspend(user.email),
              critical: true,
            },
          ] as IOption[])
        : []),
    ],
    [handleToggleSuspend, isCurrentUser, user.email, user.status]
  );

  return (
    <WebChatContextMenu
      visible={visible}
      position={position}
      onClose={onClose}
      options={userOptions}
      onOptionSelect={handleOptionSelect}
    />
  );
};

export default WebWorkspaceUsersContextMenu;
