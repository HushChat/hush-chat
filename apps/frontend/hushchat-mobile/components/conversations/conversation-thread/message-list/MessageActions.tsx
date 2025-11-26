import React from "react";
import { GestureResponderEvent, Pressable, View } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { PLATFORM } from "@/constants/platformConstants";

interface IMessageActionsProps {
  messageIsUnsend?: boolean;
  selectionMode: boolean;
  onOpenPicker: () => void;
  onOpenMenu: (event: GestureResponderEvent) => void;
  currentUserId: string;
}

export const MessageActions: React.FC<IMessageActionsProps> = ({
  messageIsUnsend,
  selectionMode,
  onOpenPicker,
  onOpenMenu,
  currentUserId,
}) => {
  if (!PLATFORM.IS_WEB || messageIsUnsend) return null;

  return (
    <View className="flex-row items-center">
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
