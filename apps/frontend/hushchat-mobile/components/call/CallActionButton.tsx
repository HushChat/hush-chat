import React from "react";
import { TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

interface CallActionButtonProps {
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  backgroundColor: string;
  iconColor?: string;
  size?: number;
  iconSize?: number;
}

const CallActionButton = ({
  iconName,
  onPress,
  backgroundColor,
  iconColor = "#FFFFFF",
  size = 56,
  iconSize = 28,
}: CallActionButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Ionicons name={iconName} size={iconSize} color={iconColor} />
    </TouchableOpacity>
  );
};

export default CallActionButton;
