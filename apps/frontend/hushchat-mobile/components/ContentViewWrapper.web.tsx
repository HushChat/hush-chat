import React, { ReactNode } from "react";
import { View } from "react-native";

interface SettingsPanelWrapperProps {
  children: ReactNode;
}

export function ContentViewWrapper({ children }: SettingsPanelWrapperProps) {
  return (
    <View className="flex-1 p-6">
      {children}
    </View>
  );
}