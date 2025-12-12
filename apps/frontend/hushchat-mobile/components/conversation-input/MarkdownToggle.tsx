import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { ICON_SIZE } from "@/constants/composerConstants";
import { useAppTheme } from "@/hooks/useAppTheme";

interface IMarkdownToggleProps {
  enabled: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

export const MarkdownToggle = ({ enabled, onToggle, disabled = false }: IMarkdownToggleProps) => {
  const { isDark } = useAppTheme();
  const iconColor = enabled ? (isDark ? "#563dc4" : "#6b4eff") : "#9CA3AF";
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      className="flex-row items-center justify-center rounded-lg"
      accessibilityLabel={enabled ? "Disable markdown rendering" : "Enable markdown rendering"}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
    >
      <Ionicons name="logo-markdown" size={ICON_SIZE} color={iconColor} />
    </Pressable>
  );
};
