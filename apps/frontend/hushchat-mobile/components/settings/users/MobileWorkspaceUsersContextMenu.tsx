import React, { useMemo, useEffect, useState, useCallback } from "react";
import { View } from "react-native";
import BottomSheet, { BottomSheetOption } from "@/components/BottomSheet";
import { TITLES } from "@/constants/constants";
import { ToastUtils } from "@/utils/toastUtils";
import { WorkspaceUser } from "@/types/user/types";

interface MobileWorkspaceUsersContextMenuProps {
  visible: boolean;
  onClose: () => void;
  user: WorkspaceUser;
  isCurrentUser: boolean;
  handleToggleSuspend: (email: string) => void;
}

const MobileWorkspaceUsersContextMenu = ({
  visible,
  onClose,
  user,
  isCurrentUser,
  handleToggleSuspend,
}: MobileWorkspaceUsersContextMenuProps) => {
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
    [handleClose]
  );

  const userOptions: BottomSheetOption[] = useMemo(() => {
    const options: BottomSheetOption[] = [];

    if (!isCurrentUser) {
      options.push({
        id: "1",
        title: TITLES.TOGGLE_SUSPENSION(user.status),
        icon: "shield-checkmark-outline",
        onPress: () => handleOptionPress(() => handleToggleSuspend(user.email)),
      });
    }

    return options;
  }, [user.email, isCurrentUser, handleToggleSuspend, handleOptionPress]);

  return (
    <View>
      <BottomSheet
        visible={sheetVisible}
        onClose={handleClose}
        title="User Options"
        options={userOptions}
      />
    </View>
  );
};

export default MobileWorkspaceUsersContextMenu;
