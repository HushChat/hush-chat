import React from "react";
import { View } from "react-native";
import { Slot } from "expo-router";
import { PLATFORM } from "@/constants/platformConstants";
import SettingsSidebar from "@/components/SettingsSidebar";

const MENU_ITEMS = [
  {
    key: "contact-us",
    title: "Contact Us",
    icon: "person-circle-outline" as const,
    route: "/settings/contact-us",
  },
];

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
      <SettingsSidebar menuItems={MENU_ITEMS} />
      <View className="flex-1">
        <Slot />
      </View>
    </View>
  );
}
