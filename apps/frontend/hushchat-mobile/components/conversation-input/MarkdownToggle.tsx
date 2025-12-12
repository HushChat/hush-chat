import React from "react";
import { Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
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
      className={classNames("flex-row items-center justify-center rounded-lg", {
        "bg-blue-500/20 dark:bg-blue-400/20": enabled,
        "bg-gray-200/50 dark:bg-gray-700/50": !enabled,
        "opacity-50": disabled,
      })}
      accessibilityLabel={enabled ? "Disable markdown rendering" : "Enable markdown rendering"}
      accessibilityRole="switch"
      accessibilityState={{ checked: enabled }}
    >
      <Ionicons name="logo-markdown" size={ICON_SIZE} color={iconColor} />
    </Pressable>
  );
};
