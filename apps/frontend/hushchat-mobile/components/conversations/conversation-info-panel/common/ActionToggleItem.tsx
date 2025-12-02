import { View, Switch } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { AppText } from "@/components/AppText";

interface IActionToggleItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export default function ActionToggleItem({
  icon,
  title,
  description,
  value,
  onValueChange,
  disabled = false,
}: IActionToggleItemProps) {
  return (
    <View className="px-4 py-4 border-b border-gray-200 dark:border-gray-700">
      <View className="flex-row items-start justify-between">
        <View className="flex-row flex-1 mr-3">
          <View className="mt-1 mr-3">
            <Ionicons name={icon} size={24} color="#6B7280" />
          </View>
          <View className="flex-1">
            <AppText className="text-base font-medium text-gray-900 dark:text-white mb-1">
              {title}
            </AppText>
            <AppText className="text-sm text-gray-500 dark:text-gray-400 leading-5">
              {description}
            </AppText>
          </View>
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          disabled={disabled}
          trackColor={{
            false: "#1A243A",
            true: "#563dc4",
          }}
          thumbColor="#ffffff"
          ios_backgroundColor="#1A243A"
        />
      </View>
    </View>
  );
}
