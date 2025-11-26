/**
 * ActionItem
 *
 * A reusable row component for rendering an action inside panel.
 */
import React from "react";
import { TouchableOpacity } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PLATFORM } from "@/constants/platformConstants";
import { AppText } from "@/components/AppText";

interface ActionItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  color?: string;
  critical?: boolean;
}

export default function ActionItem({
  icon,
  label,
  onPress,
  color,
  critical = false,
}: ActionItemProps) {
  const { isDark } = useAppTheme();

  const resolvedColor = color || (critical ? "#EF4444" : isDark ? "#9CA3AF" : "#6B7280");
  const resolvedIconSize = PLATFORM.IS_WEB ? 18 : 22;

  return (
    <TouchableOpacity
      onPress={onPress}
      className={classNames(
        "flex-row items-center rounded-lg",
        classNames("px-[5px]", PLATFORM.IS_WEB ? "py-[10px] gap-[10px]" : "py-[15px] gap-[15px]"),
        critical
          ? "hover:bg-red-100 dark:hover:bg-red-900/30"
          : "hover:bg-primary-light/10 dark:hover:bg-primary-dark/30"
      )}
    >
      <Ionicons name={icon} size={resolvedIconSize} color={resolvedColor} />

      <AppText
        className={classNames(
          "font-medium",
          PLATFORM.IS_WEB ? "text-base" : "text-xl",
          critical
            ? "text-red-600 group-hover:text-red-700 dark:group-hover:text-red-400"
            : "text-secondary-dark group-hover:text-primary-dark dark:text-secondary-light dark:group-hover:text-primary-light"
        )}
      >
        {label}
      </AppText>
    </TouchableOpacity>
  );
}
