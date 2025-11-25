import React from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { PLATFORM } from "@/constants/platformConstants";
import { getHoverVisibilityClass, getActionButtonStyle } from "@/utils/messageStyles";
import { copyToClipboard } from "@/utils/messageUtils";

interface MessageActionsProps {
  messageText?: string;
  messageIsUnsend?: boolean;
  selectionMode: boolean;
  onOpenPicker: () => void;
  onOpenMenu: (event: GestureResponderEvent) => void;
  currentUserId: string;
  isCurrentUser?: boolean;
}

export const MessageActions: React.FC<MessageActionsProps> = ({
  messageText,
  messageIsUnsend,
  selectionMode,
  onOpenPicker,
  onOpenMenu,
  currentUserId,
  isCurrentUser,
}) => {
  if (!PLATFORM.IS_WEB || messageIsUnsend) return null;

  const hoverClass = getHoverVisibilityClass();

  return (
    <View className="flex-row items-center">
      {!isCurrentUser && (
        <Pressable onPress={() => copyToClipboard(messageText)} className={hoverClass}>
          <Ionicons
            name="copy-outline"
            size={16}
            className="text-text-secondary-light dark:text-text-secondary-dark"
          />
        </Pressable>
      )}

      <Pressable
        onPress={onOpenPicker}
        disabled={!currentUserId || selectionMode}
        className={hoverClass}
        style={({ pressed }) => getActionButtonStyle(pressed)}
      >
        <View className="p-1 rounded items-center justify-center">
          <Ionicons name="happy-outline" size={16} color="#9CA3AF" />
        </View>
      </Pressable>

      {isCurrentUser && (
        <Pressable onPress={() => copyToClipboard(messageText)} className={hoverClass}>
          <Ionicons
            name="copy-outline"
            size={16}
            className="text-text-secondary-light dark:text-text-secondary-dark"
          />
        </Pressable>
      )}

      <Pressable
        onPress={onOpenMenu}
        disabled={selectionMode}
        className={hoverClass}
        style={({ pressed }) => ({
          ...getActionButtonStyle(pressed),
          marginLeft: 6,
        })}
      >
        <View className="p-1 rounded items-center justify-center">
          <Ionicons name="chevron-down-outline" size={16} color="#9CA3AF" />
        </View>
      </Pressable>
    </View>
  );
};
