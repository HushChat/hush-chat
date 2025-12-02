import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { colorScheme } from "nativewind";
import { AppText } from "@/components/AppText";

type TDragDropOverlayProps = {
  visible: boolean;
};

export default function DragAndDropOverlay({ visible }: TDragDropOverlayProps) {
  if (!visible) return null;

  const isDark = colorScheme.get() === "dark";

  return (
    <View
      pointerEvents="none"
      className="absolute inset-0 z-[9999] items-center justify-center bg-black/30 dark:bg-black/50 pointer-events-none"
    >
      <View className="items-center justify-center border-2 border-dashed border-primary-light dark:border-primary-dark rounded-3xl p-10 bg-background-light/90 dark:bg-background-dark/90">
        <Ionicons name="cloud-upload-outline" size={80} color={isDark ? "#ffffff" : "#6B4EFF"} />
        <AppText className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-4">
          Drop files here
        </AppText>
      </View>
    </View>
  );
}
