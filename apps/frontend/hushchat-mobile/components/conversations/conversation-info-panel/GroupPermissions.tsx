import { Dimensions, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { AppText } from "@/components/AppText";
import ActionToggleItem from "@/components/conversations/conversation-info-panel/common/ActionToggleItem";
import { MotionView } from "@/motion/MotionView";
import { GroupPermissionType, IConversation } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import { useUpdateMessageRestrictionsMutation } from "@/query/patch/queries";

interface IGroupPermissionsProps {
  conversation: IConversation;
  onClose: () => void;
  visible: boolean;
}

export default function GroupPermissions({
  conversation,
  onClose,
  visible,
}: IGroupPermissionsProps) {
  const screenWidth = Dimensions.get("window").width;
  const { user } = useUserStore();

  const [onlyAdminsCanSendMessages, setOnlyAdminsCanSendMessages] = useState<boolean>(
    conversation.onlyAdminsCanSendMessages
  );
  const [onlyAdminsCanAddParticipants, setOnlyAdminsCanAddParticipants] = useState<boolean>(
    conversation.onlyAdminsCanAddParticipants
  );
  const [onlyAdminsCanEditGroupInfo, setOnlyAdminsCanEditGroupInfo] = useState<boolean>(
    conversation.onlyAdminsCanEditGroupInfo
  );

  const updatePermissions = useUpdateMessageRestrictionsMutation(
    { userId: Number(user.id), conversationId: Number(conversation?.id) },
    () => {}
  );

  const handleTogglePermission = (permissionType: GroupPermissionType, newValue: boolean) => {
    if (!conversation?.id) return;

    const setters = {
      onlyAdminsCanSendMessages: setOnlyAdminsCanSendMessages,
      onlyAdminsCanAddParticipants: setOnlyAdminsCanAddParticipants,
      onlyAdminsCanEditGroupInfo: setOnlyAdminsCanEditGroupInfo,
    };

    setters[permissionType](newValue);

    updatePermissions.mutate(
      {
        conversationId: Number(conversation.id),
        permissions: {
          [permissionType]: newValue,
        },
      },
      {
        onError: () => {
          setters[permissionType](!newValue);
        },
      }
    );
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
            onValueChange={(value) =>
              handleTogglePermission(GroupPermissionType.ONLY_ADMINS_CAN_SEND_MESSAGES, value)
            }
          />
        </View>

        <View className="mt-6">
          <AppText className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Group Management
          </AppText>
          <ActionToggleItem
            icon="create-outline"
            title="Only admins can edit group info"
            description="When enabled, only group admins will be able to change the group name, description, and photo."
            value={onlyAdminsCanEditGroupInfo}
            onValueChange={(value) =>
              handleTogglePermission(GroupPermissionType.ONLY_ADMINS_CAN_EDIT_GROUP_INFO, value)
            }
          />
          <ActionToggleItem
            icon="person-add-outline"
            title="Only admins can add participants"
            description="When enabled, only group admins will be able to add new members to the group."
            value={onlyAdminsCanAddParticipants}
            onValueChange={(value) =>
              handleTogglePermission(GroupPermissionType.ONLY_ADMINS_CAN_ADD_PARTICIPANTS, value)
            }
          />
        </View>
      </ScrollView>
    </MotionView>
  );
}
