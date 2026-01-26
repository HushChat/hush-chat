import React from "react";
import { ActivityIndicator, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLOR_ACTIVITY, ICON_SIZE } from "@/constants/composerConstants";
import { useAppTheme } from "@/hooks/useAppTheme";

interface SendButtonProps {
  hasContent: boolean;
  isSending: boolean;
  onPress: () => void;
}

export const SendButton = ({ hasContent, isSending, onPress }: SendButtonProps) => {
  const { isDark } = useAppTheme();
  const iconColor = hasContent ? (isDark ? "#563dc4" : "#6b4eff") : isDark ? "#9ca3af" : "#6b7280";

  if (isSending) {
    return <ActivityIndicator size="small" color={COLOR_ACTIVITY} />;
  }

  return (
    <Pressable onPress={onPress} disabled={!hasContent}>
      <Ionicons name={"send"} size={ICON_SIZE} color={iconColor} />
    </Pressable>
  );
};
