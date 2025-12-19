import React, { useEffect, useState, useCallback } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { TUser } from "@/types/user/types";
import { UserMultiSelectList } from "@/components/UserMultiSelect";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import GroupConfigurationForm from "@/components/conversations/conversation-list/group-conversation-creation/GroupConfigurationForm";
import { IConversation } from "@/types/chat/types";

import { MotionView } from "@/motion/MotionView";
import { MotionEasing } from "@/motion/easing";
import { AppText } from "@/components/AppText";

type TWebGroupCreationOverlay = {
  visible: boolean;
  width: number;
  onClose: () => void;
  onCreate?: (conversationId: number) => void;
  setSelectedConversation: (conversation: IConversation | null) => void;
};

const COLORS = {
  white: "#FFFFFF",
};

export const WebGroupCreation = ({
  visible,
  width,
  onClose,
  onCreate,
  setSelectedConversation,
}: TWebGroupCreationOverlay) => {
  const [selectedUsers, setSelectedUsers] = useState<TUser[]>([]);
  const [showConfigurationForm, setShowConfigurationForm] = useState(false);

  useEffect(() => {
    if (visible) {
      setSelectedUsers([]);
      setShowConfigurationForm(false);
    }
  }, [visible]);

  const handleNext = useCallback(() => {
    if (selectedUsers.length === 0) return;
    setShowConfigurationForm(true);
  }, [selectedUsers.length]);

  const handleBack = useCallback(() => {
    if (showConfigurationForm) {
      setShowConfigurationForm(false);
    } else {
      onClose();
    }
  }, [showConfigurationForm, onClose]);

  const handleGroupCreated = useCallback(
    (conversationId: number) => {
      onCreate?.(conversationId);
      onClose();
    },
    [onCreate, onClose]
  );

  const participantUserIds = selectedUsers.map((u) => u.id);

  return (
    <MotionView
      visible={visible}
      pointerEvents={visible ? "auto" : "none"}
      style={[styles.overlay, { width }]}
      className="dark:bg-gray-900"
      delay={40}
      from={{ opacity: 0, translateX: width }}
      to={{ opacity: 1, translateX: 0 }}
      duration={{ enter: 240, exit: 200 }}
      easing={MotionEasing.pair}
    >
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 py-4 bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center">
          <TouchableOpacity onPress={handleBack} className="mr-3">
            <Ionicons name="arrow-back" size={22} color="#6B7280" />
          </TouchableOpacity>

          <AppText className="text-xl font-semibold text-gray-900 dark:text-white">
            {showConfigurationForm ? "Group Details" : "New group"}
          </AppText>
        </View>

        {!showConfigurationForm && (
          <TouchableOpacity
            onPress={handleNext}
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
              Continue
            </AppText>
          </TouchableOpacity>
        )}
      </View>

      <View className="flex-1 bg-background-light dark:bg-background-dark border-r border-gray-200 dark:border-gray-800 overflow-hidden">
        <MotionView
          visible={true}
          style={[styles.motionRow, { width: width * 2 }]}
          from={{ translateX: 0 }}
          to={{ translateX: showConfigurationForm ? -width : 0 }}
          duration={{ enter: 260, exit: 240 }}
          easing={MotionEasing.pair}
        >
          <View style={{ width }}>
            <UserMultiSelectList
              selectedUsers={selectedUsers}
              onChange={setSelectedUsers}
              searchPlaceholder="Add participants…"
            />
          </View>

          <View style={[styles.stepPage, { width }]}>
            {showConfigurationForm && (
              <GroupConfigurationForm
                participantUserIds={participantUserIds}
                onSuccess={handleGroupCreated}
                submitLabel="Create group"
                setSelectedConversation={setSelectedConversation}
              />
            )}
          </View>
        </MotionView>
      </View>
    </MotionView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: COLORS.white,
  },
  stepPage: {
    height: "100%",
  },
  motionRow: {
    height: "100%",
    flexDirection: "row",
  },
});
