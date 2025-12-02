import { Dimensions, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText } from "@/components/AppText";
import ActionToggleItem from "@/components/conversations/conversation-info-panel/common/ActionToggleItem";
import { MotionView } from "@/motion/MotionView";
import { logInfo } from "@/utils/logger";

interface IGroupPermissionsProps {
  conversationId: number;
  onClose: () => void;
  visible: boolean;
}

export default function GroupPermissions({
  conversationId,
  onClose,
  visible,
}: IGroupPermissionsProps) {
  const screenWidth = Dimensions.get("window").width;

  const [onlyAdminsCanSendMessages, setOnlyAdminsCanSendMessages] = useState(false);
  const [membersCanEditGroupInfo, setMembersCanEditGroupInfo] = useState(true);
  const [membersCanAddParticipants, setMembersCanAddParticipants] = useState(true);

  // TODO: Fetch current permissions from API on mount
  // TODO: Implement save functionality
  const handleSave = async () => {
    logInfo(conversationId);
    onClose();
  };

  return (
    <MotionView
      visible={visible}
      className="absolute top-0 bottom-0 left-0 right-0 bg-background-light dark:bg-background-dark"
      from={{ translateX: screenWidth, opacity: 0 }}
      to={{ translateX: 0, opacity: 1 }}
    >
      <View className="flex-row items-center justify-between px-4 py-4">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={onClose} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#6B7280" />
          </TouchableOpacity>
          <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
            Group Permissions
          </AppText>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          className="px-3 py-2 rounded-lg bg-primary-light dark:bg-primary-dark"
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
        >
          <AppText className="text-xs font-medium leading-none text-white">Save</AppText>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
        <View className="mt-4">
          <AppText className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Messaging
          </AppText>
          <ActionToggleItem
            icon="chatbubble-outline"
            title="Only admins can send messages"
            description="When enabled, only group admins will be able to send messages. Members can only read."
            value={onlyAdminsCanSendMessages}
            onValueChange={setOnlyAdminsCanSendMessages}
          />
        </View>

        <View className="mt-6">
          <AppText className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Group Management
          </AppText>
          <ActionToggleItem
            icon="create-outline"
            title="Members can edit group info"
            description="Allow all members to change group name, description, and photo."
            value={membersCanEditGroupInfo}
            onValueChange={setMembersCanEditGroupInfo}
          />
          <ActionToggleItem
            icon="person-add-outline"
            title="Members can add participants"
            description="Allow all members to add new participants to the group."
            value={membersCanAddParticipants}
            onValueChange={setMembersCanAddParticipants}
          />
        </View>
      </ScrollView>
    </MotionView>
  );
}
