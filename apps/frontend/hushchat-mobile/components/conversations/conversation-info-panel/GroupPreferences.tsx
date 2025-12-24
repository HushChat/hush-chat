import { Dimensions, TouchableOpacity, View, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { AppText } from "@/components/AppText";
import ActionToggleItem from "@/components/conversations/conversation-info-panel/common/ActionToggleItem";
import { MotionView } from "@/motion/MotionView";
import { IConversation } from "@/types/chat/types";
import { useUserStore } from "@/store/user/useUserStore";
import { useToggleNotifyOnlyOnMentionMutation } from "@/query/patch/queries";

interface IGroupPreferencesProps {
  conversation: IConversation;
  onClose: () => void;
  visible: boolean;
}

export default function GroupPreferences({
  conversation,
  onClose,
  visible,
}: IGroupPreferencesProps) {
  const screenWidth = Dimensions.get("window").width;
  const { user } = useUserStore();

  const [notifyOnMentionsOnly, setNotifyOnMentionsOnly] = useState<boolean>(
    conversation.notifyOnMentionsOnly
  );

  useEffect(() => {
    setNotifyOnMentionsOnly(conversation.notifyOnMentionsOnly);
  }, [conversation.notifyOnMentionsOnly]);

  const toggleNotifyOnlyOnMentionMutation = useToggleNotifyOnlyOnMentionMutation(
    { userId: Number(user.id), conversationId: Number(conversation?.id) },
    () => {}
  );

  const handleToggleNotifyOnlyOnMentions = (newValue: boolean) => {
    if (!conversation?.id) return;

    setNotifyOnMentionsOnly(newValue);

    toggleNotifyOnlyOnMentionMutation.mutate(
      {
        conversationId: Number(conversation?.id),
      },
      {
        onError: () => {
          setNotifyOnMentionsOnly(!newValue);
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
            Group Preferences
          </AppText>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
        <View className="mt-4">
          <AppText className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
            Notifications
          </AppText>
          <ActionToggleItem
            icon="notifications-outline"
            title="Mentions Only"
            description="Receive notifications only when someone mentions you in this conversation."
            value={notifyOnMentionsOnly}
            onValueChange={handleToggleNotifyOnlyOnMentions}
          />
        </View>
      </ScrollView>
    </MotionView>
  );
}
