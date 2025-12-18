import { Pressable, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useAppTheme } from "@/hooks/useAppTheme";
import { AppText } from "@/components/AppText";

const COLORS = {
  SHADOW_COLOR: "#000000",
};

interface PinnedMessageBarProps {
  senderName: string;
  messageText: string;
  onPress?: () => void;
  onUnpin?: () => void;
}

export const PinnedMessageBar = ({
  senderName,
  messageText,
  onPress,
  onUnpin,
}: PinnedMessageBarProps) => {
  const { isDark } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center px-4 py-3 bg-secondary-light/40 dark:bg-secondary-dark/40 border-l-4 border-primary-light dark:border-primary-dark shadow-sm"
      style={styles.containerShadow}
    >
      <View className="w-8 h-8 rounded-full bg-blue-500/10 dark:bg-blue-400/10 items-center justify-center mr-3">
        <Ionicons
          name="pin"
          size={16}
          style={{ transform: [{ rotate: "45deg" }] }}
          className="!text-primary-light dark:!text-primary-dark"
        />
      </View>

      <View className="flex-1 min-w-0">
        <View className="flex-row items-center mb-0.5">
          <AppText className="text-xs font-medium text-primary-light dark:text-text-primary-dark uppercase tracking-wide">
            Pinned
          </AppText>
          <View className="w-1 h-1 rounded-full bg-primary-light dark:bg-primary-dark mx-2" />
          <AppText className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            {senderName}
          </AppText>
        </View>
        <AppText
          className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed"
          numberOfLines={2}
        >
          {messageText}
        </AppText>
      </View>

      <Pressable
        onPress={onUnpin}
        className="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 items-center justify-center ml-3"
        hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
      >
        <Ionicons name="close" size={14} color={isDark ? "#FAFAF9" : "#050506"} />
      </Pressable>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  containerShadow: {
    shadowColor: COLORS.SHADOW_COLOR,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
});
