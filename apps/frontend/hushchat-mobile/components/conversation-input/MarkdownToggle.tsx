import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

interface IMarkdownToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const MarkdownToggle = ({ enabled, onToggle }: IMarkdownToggleProps) => {
  const { isDark } = useAppTheme();
  const iconColor = enabled ? (isDark ? "#563dc4" : "#6b4eff") : "#9CA3AF";
  return (
    <Pressable
      onPress={onToggle}
      className="flex-row items-center justify-center rounded-lg"
      accessibilityLabel={enabled ? "Disable markdown rendering" : "Enable markdown rendering"}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
    >
      <Ionicons name="logo-markdown" size={20} color={iconColor} />
    </Pressable>
  );
};
