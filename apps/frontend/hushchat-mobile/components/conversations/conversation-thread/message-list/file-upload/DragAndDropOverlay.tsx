import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

type TDragDropOverlayProps = {
  visible: boolean;
  variant?: "default" | "avatar";
};

export default function DragAndDropOverlay({
  visible,
  variant = "default",
}: TDragDropOverlayProps) {
  const { isDark } = useAppTheme();

  if (!visible) return null;

  const isAvatar = variant === "avatar";

  const containerClasses = isAvatar
    ? "absolute inset-0 z-[9999] items-center justify-center bg-black/60 rounded-full"
    : "absolute inset-0 z-[9999] items-center justify-center bg-black/30 dark:bg-black/50";

  const innerBoxClasses = isAvatar
    ? "items-center justify-center"
    : "items-center justify-center border-2 border-dashed border-primary-light dark:border-primary-dark rounded-3xl p-10 bg-background-light/90 dark:bg-background-dark/90";

  return (
    <View pointerEvents="none" className={containerClasses}>
      <View className={innerBoxClasses}>
        <Ionicons
          name="cloud-upload-outline"
          size={isAvatar ? 40 : 80}
          color={isDark || isAvatar ? "#ffffff" : "#6B4EFF"}
        />

        {!isAvatar && (
          <AppText className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-4">
            Drop files here
          </AppText>
        )}
      </View>
    </View>
  );
}
