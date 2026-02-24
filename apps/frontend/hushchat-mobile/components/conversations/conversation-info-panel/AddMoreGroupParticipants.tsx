import React, { useState } from "react";
import { Dimensions, TouchableOpacity, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { UserMultiSelectList } from "@/components/UserMultiSelect";
import { TUser } from "@/types/user/types";
import { useCreateAddParticipantsMutation } from "@/query/post/queries";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { ToastUtils } from "@/utils/toastUtils";
import { getAPIErrorMsg } from "@/utils/commonUtils";
import { MotionView } from "@/motion/MotionView";
import { AppText } from "@/components/AppText";

interface AddParticipantsProps {
  conversationId: number;
  onClose: () => void;
  visible: boolean;
}

export default function AddMoreGroupParticipants({
  conversationId,
  onClose,
  visible,
}: AddParticipantsProps) {
  const screenWidth = Dimensions.get("window").width;
  const [selectedUsers, setSelectedUsers] = useState<TUser[]>([]);

  const { mutate: addParticipants } = useCreateAddParticipantsMutation(
    { conversationId: conversationId, keyword: "" },
    () => {
      onClose();
    },
    (error) => {
      ToastUtils.error(getAPIErrorMsg(error));
    }
  );

  const saveAddParticipants = async () => {
    if (!selectedUsers || selectedUsers.length === 0) return;
    const newParticipantIds = selectedUsers.map((p) => p.id);
    addParticipants({ conversationId, newParticipantIds });
  };

  return (
    <MotionView
      visible={visible}
      from={{ translateX: screenWidth, opacity: 0 }}
      to={{ translateX: 0, opacity: 1 }}
      duration={{ enter: 250, exit: 200 }}
      easing="standard"
      style={styles.absoluteFill}
      className="dark:bg-gray-900"
      pointerEvents={visible ? "auto" : "none"}
    >
      <View className="flex-row items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onClose} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#6B7280" />
          </TouchableOpacity>
          <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
            Add Participants
          </AppText>
        </View>

        <View className="flex-row gap-x-2">
          <TouchableOpacity
            onPress={() =>
              addParticipants({ conversationId, newParticipantIds: [], addAllWorkspaceUsers: true })
            }
            className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700"
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
          >
            <AppText className="text-xs font-medium leading-none text-gray-700 dark:text-gray-300">
              Add All
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={saveAddParticipants}
            disabled={selectedUsers.length === 0}
            className={`px-3 py-2 rounded-lg ${
              selectedUsers.length > 0
                ? "bg-primary-light dark:bg-primary-dark"
                : "bg-gray-300 dark:bg-gray-700"
            }`}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
          >
            <AppText
              className={`text-xs font-medium leading-none ${
                selectedUsers.length > 0 ? "text-white" : "text-gray-500 dark:text-gray-300"
              }`}
            >
              Add
            </AppText>
          </TouchableOpacity>
        </View>
      </View>

      <View className="w-full h-full">
        <UserMultiSelectList
          selectedUsers={selectedUsers}
          onChange={setSelectedUsers}
          searchPlaceholder="Add participants…"
          conversationId={conversationId}
          autoFocusSearch={true}
        />
      </View>
    </MotionView>
  );
}

const styles = StyleSheet.create({
  absoluteFill: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
});
