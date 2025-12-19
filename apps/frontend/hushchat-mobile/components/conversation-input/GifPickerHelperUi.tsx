import React from "react";
import { View, TouchableOpacity } from "react-native";
import { AppText, AppTextInput } from "@/components/AppText";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "@/hooks/useAppTheme";

export const GifPickerHeader = ({ onClose }: { onClose: () => void }) => {
  const { isDark } = useAppTheme();
  return (
    <View className="flex-row items-center justify-between border-b border-gray-200 dark:border-gray-800 p-4">
      <AppText className="text-lg font-semibold dark:text-white">Select GIF</AppText>
      <TouchableOpacity
        onPress={onClose}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700"
      >
        <Ionicons
          name="close"
          size={24}
          className="text-gray-500 dark:text-gray-400"
          color={isDark ? "#FAFAF9" : "#050506"}
        />
      </TouchableOpacity>
    </View>
  );
};

export const GifPickerSearch = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) => {
  return (
    <View className="p-3">
      <AppTextInput
        className="rounded-[20px] bg-gray-100 dark:bg-gray-800 p-3 text-base dark:text-white"
        placeholder="Search GIFs..."
        placeholderTextColor="#9CA3AF"
        value={value}
        onChangeText={onChange}
        autoCapitalize="none"
      />
    </View>
  );
};

export const GifPickerFooter = () => (
  <View className="items-center border-t border-gray-200 dark:border-gray-800 p-3">
    <AppText className="text-xs text-gray-500 dark:text-gray-400">Powered by Tenor</AppText>
  </View>
);
