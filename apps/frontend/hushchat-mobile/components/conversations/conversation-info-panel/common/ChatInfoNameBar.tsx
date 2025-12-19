import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

type ChatInfoNameBarProps = {
  title: string;
  isWebView?: boolean;
  showActions?: boolean;
  onPressChat?: () => void;
  onPressCall?: () => void;
  onPressSearch?: () => void;
};

export default function ChatInfoNameBar({
  title,
  showActions = false,
  onPressChat,
  onPressCall,
  onPressSearch,
}: ChatInfoNameBarProps) {
  const isMobileLayout = useIsMobileLayout();
  return (
    <View className="px-4 py-[14px] flex-row items-center justify-between">
      <AppText
        className={`font-semibold text-black dark:text-white ${!isMobileLayout ? "text-lg" : "text-xl"}`}
        numberOfLines={1}
      >
        {title}
      </AppText>

      {showActions && isMobileLayout && (
        <View className="flex-row gap-[10px]">
          <TouchableOpacity
            className="rounded-full p-[10px] bg-secondary-light dark:bg-secondary-dark"
            onPress={onPressSearch}
          >
            <Ionicons
              name="search"
              size={22}
              className="!text-primary-light dark:!text-primary-dark"
            />
          </TouchableOpacity>
          <TouchableOpacity
            className="rounded-full p-[10px] bg-secondary-light dark:bg-secondary-dark"
            onPress={onPressChat}
          >
            <Ionicons
              name="chatbox"
              size={22}
              className="!text-primary-light dark:!text-primary-dark"
            />
          </TouchableOpacity>

          <TouchableOpacity
            className="rounded-full p-[10px] bg-secondary-light dark:bg-secondary-dark"
            onPress={onPressCall}
          >
            <Ionicons
              name="call"
              size={22}
              className="!text-primary-light dark:!text-primary-dark"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
