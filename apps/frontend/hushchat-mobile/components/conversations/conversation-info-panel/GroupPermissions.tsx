import { Dimensions, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { AppText } from "@/components/AppText";
import ActionToggleItem from "@/components/conversations/conversation-info-panel/common/ActionToggleItem";
import { MotionView } from "@/motion/MotionView";
import { IConversation } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import {
  useUpdateMessageRestrictionsMutation,
  useUpdateOnlyAdminsCanPinMessagesMutation,
} from "@/query/patch/queries";
import { useUpdateCache } from "@/query/config/useUpdateCache";
import { conversationQueryKeys } from "@/constants/queryKeys";
import { ToastUtils } from "@/utils/toastUtils";

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
  const updateCache = useUpdateCache();
  const onlyAdminsCanPinMessages = conversation.onlyAdminsCanPinMessages;

  const [onlyAdminsCanSendMessages, setOnlyAdminsCanSendMessages] = useState<boolean>(
    conversation.onlyAdminsCanSendMessages
  );
  // const [membersCanEditGroupInfo, setMembersCanEditGroupInfo] = useState(true);

  const updateOnlyAdminsCanPinMessages = useUpdateOnlyAdminsCanPinMessagesMutation(
    { conversationId: Number(conversation?.id), onlyAdminsCanPinMessages },
    () => {}
  );

  const handleToggleOnlyAdminsCanPinMessages = (newValue: boolean) => {
    if (!conversation?.id) return;

    updateOnlyAdminsCanPinMessages.mutate(
      {
        conversationId: Number(conversation?.id),
        onlyAdminsCanPinMessages: newValue,
      },
      {
        onSuccess: (data) => {
          updateCache(
            conversationQueryKeys.metaDataById(Number(user.id ?? 0), Number(conversation?.id ?? 0)),
            (prev) => (prev ? { ...prev, onlyAdminsCanPinMessages: data.data } : prev)
          );
        },
        onError: () => {
          ToastUtils.error("Something went wrong!");
        },
      }
    );
  };

  const updateOnlyAdminCanSendMessage = useUpdateMessageRestrictionsMutation(
    { userId: Number(user.id), conversationId: Number(conversation?.id) },
    () => {}
  );

  const handleToggleOnlyAdmins = (newValue: boolean) => {
    if (!conversation?.id) return;

    setOnlyAdminsCanSendMessages(newValue);

    updateOnlyAdminCanSendMessage.mutate(
      {
        conversationId: Number(conversation?.id),
        onlyAdminsCanSendMessages: newValue,
      },
      {
        onError: () => {
          setOnlyAdminsCanSendMessages(!newValue);
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
            onValueChange={handleToggleOnlyAdmins}
          />
        </View>

        <View className="mt-6">
          <AppText className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Group Management
          </AppText>
          {/*<ActionToggleItem*/}
          {/*  icon="create-outline"*/}
          {/*  title="Members can edit group info"*/}
          {/*  description="Allow all members to change group name, description, and photo."*/}
          {/*  value={membersCanEditGroupInfo}*/}
          {/*  onValueChange={setMembersCanEditGroupInfo}*/}
          {/*/>*/}
          {/*<ActionToggleItem*/}
          {/*  icon="person-add-outline"*/}
          {/*  title="Members can add participants"*/}
          {/*  description="Allow all members to add new participants to the group."*/}
          {/*  value={membersCanAddParticipants}*/}
          {/*  onValueChange={setMembersCanAddParticipants}*/}
          {/*/>*/}
          <ActionToggleItem
            icon="pin-outline"
            title="Only admins can pin Messages"
            description="Allow only admins of the group to pin/unpin messages"
            value={onlyAdminsCanPinMessages}
            onValueChange={handleToggleOnlyAdminsCanPinMessages}
          />
        </View>
      </ScrollView>
    </MotionView>
  );
}
