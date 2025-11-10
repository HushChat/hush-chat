import React from "react";
import { View } from "react-native";
import { usePathname } from "expo-router";
import SettingsMenu from "@/components/SettingsMenu";

interface SettingsLayoutWrapperProps {
  children: React.ReactNode;
}

export default function SettingsLayoutWrapper({ children }: SettingsLayoutWrapperProps) {
  const pathname = usePathname();
  const isSettingsIndex = pathname === "/(tabs)/settings" || pathname === "/settings";

  if (isSettingsIndex) {
    return (
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <SettingsMenu />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-background-light dark:bg-background-dark">
      {children}
    </View>
  );
}