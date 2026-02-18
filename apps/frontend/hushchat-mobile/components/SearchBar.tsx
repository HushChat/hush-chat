import { PLATFORM } from "@/constants/platformConstants";
import { useAppTheme } from "@/hooks/useAppTheme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Pressable, TextInput, View, StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, withTiming } from "react-native-reanimated";
import { AppTextInput, AppText } from "./AppText";

const COLORS = {
  BORDER_TRANSPARENT: "transparent",
};

const webInputStyle = PLATFORM.IS_WEB ? { outline: "none", boxShadow: "none" } : {};

interface SearchBarProps {
  inputRef?: React.RefObject<TextInput>;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
  autoFocus?: boolean;
  showCancel?: boolean;
  onCancel?: () => void;
}

const SearchBar = ({
  inputRef,
  value,
  onChangeText,
  placeholder = "Search...",
  onClear,
  autoFocus = false,
  showCancel = false,
  onCancel,
}: SearchBarProps) => {
  const { isDark } = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);

  const containerAnimatedStyle = useAnimatedStyle(() => ({
    borderColor: withTiming(isFocused ? (isDark ? "#563dc4" : "#6B4EFF") : "transparent", {
      duration: 200,
    }),
    backgroundColor: withTiming(
      isFocused
        ? isDark
          ? "rgba(86, 61, 196, 0.1)"
          : "rgba(107, 78, 255, 0.05)"
        : isDark
          ? "rgba(31, 41, 55, 1)"
          : "rgba(243, 244, 246, 1)",
      { duration: 200 }
    ),
  }));

  const iconColor = isFocused ? (isDark ? "#563dc4" : "#6B4EFF") : isDark ? "#9CA3AF" : "#6B7280";

  return (
    <View className="flex-row items-center flex-1 gap-2">
      <Animated.View
        className="flex-row items-center rounded-full px-3 flex-1"
        style={[containerAnimatedStyle, { borderWidth: 1.5 }]}
      >
        <Ionicons name="search" size={20} color={iconColor} />
        <AppTextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#9CA3AF" : "#6B7280"}
          className="py-2 flex-1 text-gray-900 dark:text-white rounded-full px-2"
          style={[styles.inputBase, webInputStyle, { backgroundColor: "transparent" }]}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...(PLATFORM.IS_IOS && {
            clearButtonMode: "never",
          })}
        />
        {value && (
          <Pressable
            className="rounded-full bg-gray-300 dark:bg-gray-700 size-[17px] flex-row items-center justify-center"
            onPress={onClear}
          >
            <Ionicons
              name="close"
              size={13}
              className="!text-text-secondary-light dark:!text-text-secondary-dark"
            />
          </Pressable>
        )}
      </Animated.View>

      {showCancel && isFocused && (
        <Pressable onPress={onCancel} className="px-2">
          <AppText className="text-primary-light dark:text-primary-dark font-medium">
            Cancel
          </AppText>
        </Pressable>
      )}
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({
  inputBase: {
    borderWidth: 0,
    borderColor: COLORS.BORDER_TRANSPARENT,
  },
});
