import { Dimensions, TouchableOpacity, View, StyleSheet, ScrollView } from "react-native";
import Animated, {
  useSharedValue,
  withTiming,
  withDelay,
  useAnimatedStyle,
  Easing,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText } from "@/components/AppText";
import ActionToggleItem from "@/components/conversations/conversation-info-panel/common/ActionToggleItem";

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
  const translateX = useSharedValue(screenWidth);
  const opacity = useSharedValue(0);

  const [onlyAdminsCanSendMessages, setOnlyAdminsCanSendMessages] = useState(false);
  const [membersCanEditGroupInfo, setMembersCanEditGroupInfo] = useState(true);
  const [membersCanAddParticipants, setMembersCanAddParticipants] = useState(true);

  // TODO: Fetch current permissions from API on mount
  // TODO: Implement save functionality
  const handleSave = async () => {
    console.log("Saving permissions:", {
      conversationId,
      onlyAdminsCanSendMessages,
      membersCanEditGroupInfo,
      membersCanAddParticipants,
    });
    onClose();
  };

  useEffect(() => {
    if (visible) {
      translateX.value = withTiming(0, {
        duration: 240,
        easing: Easing.out(Easing.cubic),
      });
      opacity.value = withDelay(
        40,
        withTiming(1, { duration: 160, easing: Easing.out(Easing.quad) })
      );
    } else {
      translateX.value = withTiming(screenWidth, {
        duration: 200,
        easing: Easing.in(Easing.cubic),
      });
      opacity.value = withTiming(0, {
        duration: 120,
        easing: Easing.in(Easing.quad),
      });
    }
  }, [visible, screenWidth, translateX, opacity]);

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.absoluteFill, containerStyle]}
      className="bg-background-light dark:bg-background-dark"
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
    </Animated.View>
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
