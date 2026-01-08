import React from "react";
import { View, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import classNames from "classnames";
import { AppText } from "@/components/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

interface IDocumentPreviewFallbackProps {
  error: boolean;
  message: string;
  actionLabel: string;
  onAction: () => void;
}

export const DocumentPreviewFallback = ({
  error,
  message,
  actionLabel,
  onAction,
}: IDocumentPreviewFallbackProps) => {
  const isDark = useAppTheme();

  const themeColors = {
    primary: isDark ? "#563dc4" : "#6B4EFF",
    error: "#EF4444",
  };

  return (
    <View className="flex-1 items-center justify-center p-6 bg-background-light dark:bg-background-dark">
      <View className="w-24 h-24 bg-secondary-light dark:bg-secondary-dark rounded-3xl items-center justify-center mb-6">
        <Ionicons
          name="document-text"
          size={48}
          color={error ? themeColors.error : themeColors.primary}
        />
      </View>

      <AppText className="text-lg text-center font-medium mb-2 text-text-primary-light dark:text-text-primary-dark">
        {error ? "Preview Failed" : "Preview Unavailable"}
      </AppText>

      <AppText className="text-sm text-center text-text-secondary-light dark:text-text-secondary-dark mb-6">
        {message}
      </AppText>

      <Pressable
        onPress={onAction}
        className={classNames(
          "bg-primary-light dark:bg-primary-dark",
          "px-6 py-3 rounded-full active:opacity-90 hover:opacity-90"
        )}
      >
        <AppText className="text-white font-semibold">{actionLabel}</AppText>
      </Pressable>
    </View>
  );
};
