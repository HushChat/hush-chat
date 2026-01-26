import React from "react";
import { Pressable, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";
import { AppText } from "@/components/AppText";

interface IMarkdownToggleProps {
  enabled: boolean;
  onToggle: () => void;
}

export const MarkdownToggle = ({ enabled, onToggle }: IMarkdownToggleProps) => {
  const { isDark } = useAppTheme();
  const iconColor = enabled ? (isDark ? "#563dc4" : "#6b4eff") : isDark ? "#9ca3af" : "#6b7280";

  return (
    <View className="relative group flex-row items-center justify-center">
      <Pressable
        onPress={onToggle}
        className="flex-row items-center justify-center rounded-lg p-1"
        accessibilityLabel={enabled ? "Disable markdown" : "Enable markdown"}
        accessibilityRole="switch"
        accessibilityState={{ checked: enabled }}
      >
        <Ionicons name="logo-markdown" size={20} color={iconColor} />
      </Pressable>

      <View className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none z-50 transition-opacity duration-200">
        <View className="bg-gray-800 dark:bg-zinc-900 px-3 py-1.5 rounded-md shadow-md">
          <AppText className="text-white text-xs font-medium whitespace-nowrap">Markdown</AppText>
          <View className="absolute -bottom-1 left-1/2 -translate-x-1/2">
            <View className="w-0 h-0 border-l-[4px] border-r-[4px] border-t-[6px] border-l-transparent border-r-transparent border-t-gray-800 dark:border-t-zinc-900" />
          </View>
        </View>
      </View>
    </View>
  );
};
