import React from "react";
import { View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

type TVariantType = "default" | "avatar";

type TVariantConfig = {
  containerClasses: string;
  innerBoxClasses: string;
  iconSize: number;
  showText: boolean;
  getIconColor: (isDark: boolean) => string;
};

const VARIANT_CONFIG: Record<TVariantType, TVariantConfig> = {
  default: {
    containerClasses:
      "absolute inset-0 z-[9999] items-center justify-center bg-black/30 dark:bg-black/50",
    innerBoxClasses:
      "items-center justify-center border-2 border-dashed border-primary-light dark:border-primary-dark rounded-3xl p-10 bg-background-light/90 dark:bg-background-dark/90",
    iconSize: 80,
    showText: true,
    getIconColor: (isDark) => (isDark ? "#ffffff" : "#6B4EFF"),
  },
  avatar: {
    containerClasses:
      "absolute inset-0 z-[9999] items-center justify-center bg-black/60 rounded-full",
    innerBoxClasses: "items-center justify-center",
    iconSize: 40,
    showText: false,
    getIconColor: () => "#ffffff",
  },
};

type TDragDropOverlayProps = {
  visible: boolean;
  variant?: TVariantType;
};

export default function DragAndDropOverlay({
  visible,
  variant = "default",
}: TDragDropOverlayProps) {
  const { isDark } = useAppTheme();

  if (!visible) return null;

  const config = VARIANT_CONFIG[variant];
  const iconColor = config.getIconColor(isDark);

  return (
    <View pointerEvents="none" className={config.containerClasses}>
      <View className={config.innerBoxClasses}>
        <Ionicons name="cloud-upload-outline" size={config.iconSize} color={iconColor} />

        {config.showText && (
          <AppText className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark mt-4">
            Drop files here
          </AppText>
        )}
      </View>
    </View>
  );
}
