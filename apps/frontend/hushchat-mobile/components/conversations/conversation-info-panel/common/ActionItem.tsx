/**
 * ActionItem
 *
 * A reusable row component for rendering an action inside panel.
 */
import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import classNames from "classnames";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { PLATFORM } from "@/constants/platformConstants";

interface ActionItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  color?: string;
  showOn?: boolean;
}

export default function ActionItem({ icon, label, onPress, color }: ActionItemProps) {
  const { isDark } = useAppTheme();

  const resolvedColor = color || (isDark ? "#9CA3AF" : "#6B7280");

  return (
    <TouchableOpacity
      onPress={onPress}
      className={classNames(
        "flex-row items-center px-[5px]",
        PLATFORM.IS_WEB ? "py-[10px] gap-[10px]" : "py-[15px] gap-[15px]"
      )}
    >
      <Ionicons name={icon} size={PLATFORM.IS_WEB ? 18 : 22} color={resolvedColor} />

      <Text
        className={classNames("font-medium", PLATFORM.IS_WEB ? "text-base" : "text-xl")}
        style={[styles.textBase, { color: color || (isDark ? "white" : "#1F2937") }]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  textBase: {
    fontFamily: "Poppins-Regular",
  },
});
