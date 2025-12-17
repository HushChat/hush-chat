import { View, Pressable } from "react-native";
import React from "react";
import classNames from "classnames";
import { PLATFORM } from "@/constants/platformConstants";
import { MaterialIcons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

export interface SidebarMenuItem {
  key: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export default function SidebarMenu({
  items,
  selectedKey,
  onSelect,
}: {
  items: SidebarMenuItem[];
  selectedKey: string;
  onSelect: (key: string) => void;
}) {
  const { isDark } = useAppTheme();
  return (
    <View className="w-full mt-4 gap-2">
      {items.map((item) => {
        const isSelected = selectedKey === item.key;
        const color = isSelected
          ? isDark
            ? "#FAFAFA"
            : "#2d333b"
          : isDark
            ? "#D1D5DB"
            : "#4B5563";

        return (
          <Pressable
            key={item.key}
            onPress={() => onSelect(item.key)}
            className={classNames(
              "flex-row items-center gap-3 py-3 px-4 rounded-xl mb-1",
              "active:bg-secondary-light dark:active:bg-secondary-dark",
              PLATFORM.IS_WEB && "hover:bg-blue-100/60 hover:dark:bg-secondary-dark",
              isSelected
                ? "bg-blue-100/60 dark:bg-secondary-dark"
                : "bg-background-light dark:bg-background-dark"
            )}
          >
            <MaterialIcons name={item.icon} size={20} color={color} />

            <AppText
              className={classNames(
                "text-base font-medium flex-1",
                isSelected
                  ? "!text-text-primary-light dark:!text-text-primary-dark"
                  : "!text-gray-700 dark:!text-text-secondary-dark"
              )}
            >
              {item.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}
