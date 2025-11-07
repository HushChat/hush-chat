import React from "react";
import { View } from "react-native";
import { Slot } from "expo-router";
import { PLATFORM } from "@/constants/platformConstants";
import SettingsSidebar from "@/components/SettingsSidebar";

export default function SettingsLayout() {
  if (!PLATFORM.IS_WEB) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <Slot />
      </View>
    );
  }

  return (
    <View className="flex-1 flex-row bg-background-light dark:bg-background-dark">
      <SettingsSidebar />
      <View className="flex-1">
        <Slot />
      </View>
    </View>
  );
}