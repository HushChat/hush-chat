import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useAppTheme } from "@/hooks/useAppTheme";

export default function CallComingSoon() {
  const insets = useSafeAreaInsets();

  const { isDark } = useAppTheme();

  const iconColor = isDark ? "white" : "black";

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      <View
        className="bg-background-light dark:bg-background-dark px-4 py-3"
        style={{ paddingTop: insets.top + 12 }}
      >
        <AppText className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Calls
        </AppText>
      </View>

      <View className="flex-1 items-center justify-center px-6 pb-20 -mt-10">
        <View className="mb-8 items-center justify-center relative">
          <View className="absolute w-40 h-40 bg-primary-light/5 dark:bg-primary-dark/10 rounded-full" />

          <Ionicons name="call-outline" size={52} color={iconColor} className="-rotate-3" />
        </View>

        <View className="items-center">
          <AppText className="mt-8 text-xl font-bold text-text-primary-light dark:text-text-primary-dark text-center mb-2">
            Calls are on the way
          </AppText>

          <AppText className="text-base text-gray-500 dark:text-gray-400 text-center leading-relaxed px-4">
            We are building a powerful new calling experience. Stay tuned for updates!
          </AppText>
        </View>
      </View>
    </View>
  );
}
