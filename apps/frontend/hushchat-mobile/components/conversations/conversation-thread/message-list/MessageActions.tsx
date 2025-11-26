import React from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { PLATFORM } from "@/constants/platformConstants";
import { copyToClipboard } from "@/utils/messageUtils";

interface IMessageActionsProps {
  messageText?: string;
  messageIsUnsend?: boolean;
  selectionMode: boolean;
  onOpenPicker: () => void;
  onOpenMenu: (event: GestureResponderEvent) => void;
  currentUserId: string;
  isCurrentUser?: boolean;
}

export const MessageActions: React.FC<IMessageActionsProps> = ({
  messageText,
  messageIsUnsend,
  selectionMode,
  onOpenPicker,
  onOpenMenu,
  currentUserId,
  isCurrentUser,
}) => {
  if (!PLATFORM.IS_WEB || messageIsUnsend) return null;

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
        className={classNames({
          "opacity-0 group-hover:opacity-100 hover:opacity-100": PLATFORM.IS_WEB,
          "opacity-100": !PLATFORM.IS_WEB,
        })}
        style={({ pressed }) => ({
          minWidth: 24,
          minHeight: 24,
          opacity: pressed ? 0.7 : 1,
          cursor: "pointer" as const,
        })}
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
        className={classNames({
          "opacity-0 group-hover:opacity-100 hover:opacity-100": PLATFORM.IS_WEB,
          "opacity-100": !PLATFORM.IS_WEB,
        })}
        style={({ pressed }) => ({
          minWidth: 24,
          minHeight: 24,
          opacity: pressed ? 0.7 : 1,
          cursor: "pointer" as const,
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
