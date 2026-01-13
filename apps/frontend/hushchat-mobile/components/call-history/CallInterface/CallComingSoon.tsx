import React from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";
import { PLATFORM } from "@/constants/platformConstants";
import { AppText } from "@/components/AppText";
import Placeholder from "@/components/Placeholder";

/**
 * Web Layout
 */
const WebInterface = () => {
  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark font-inter">
      <View className="w-[470px] min-w-72 max-w-2xl lg:w-[460px] px-4 sm:px-6 py-6">
        <AppText className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
          Calls
        </AppText>
      </View>

      <View className="flex-1 -mt-20">
        <Placeholder
          title="Calls are on the way"
          subtitle="We are building a powerful new calling experience. Stay tuned for updates!"
          icon={
            <Ionicons
              name="call-outline"
              size={50}
              className="text-text-primary-light dark:text-text-primary-dark opacity-80"
            />
          }
          imageWidth={100}
          imageHeight={100}
          showBackground={true}
        />
      </View>
    </View>
  );
};

/**
 * Mobile Layout
 */
const MobileInterface = () => {
  const insets = useSafeAreaInsets();

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

      <View className="flex-1 pb-20">
        <Placeholder
          title="Calls are on the way"
          subtitle="We are building a powerful new calling experience. Stay tuned for updates!"
          icon={
            <Ionicons
              name="call-outline"
              size={52}
              className="opacity-90 -rotate-3"
              color="white"
            />
          }
          imageWidth={100}
          imageHeight={100}
          showBackground={true}
        />
      </View>
    </View>
  );
};

export default function CallComingSoon() {
  const isMobileLayout = useIsMobileLayout();
  const mobileSelected = !PLATFORM.IS_WEB || isMobileLayout;

  if (mobileSelected) {
    return <MobileInterface />;
  }

  return <WebInterface />;
}
