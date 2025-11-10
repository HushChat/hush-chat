import React from "react";
import { View } from "react-native";
import { usePathname } from "expo-router";
import SettingsMenu from "@/components/SettingsMenu";
import SettingsPlaceholderWeb from "@/components/SettingsPlaceholderWeb";

interface SettingsLayoutWrapperProps {
  children: React.ReactNode;
}

export default function SettingsLayoutWrapper({ children }: SettingsLayoutWrapperProps) {
  const pathname = usePathname();
  const isSettingsIndex = pathname === "/(tabs)/settings" || pathname === "/settings";

  return (
    <View className="flex-1 flex-row bg-background-light dark:bg-background-dark">
      <SettingsMenu />
      <View className="flex-1">
        {isSettingsIndex ? <SettingsPlaceholderWeb /> : children}
      </View>
    </View>
  );
}