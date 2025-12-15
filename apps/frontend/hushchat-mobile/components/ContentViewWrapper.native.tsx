import { PLATFORM } from "@/constants/platformConstants";
import React, { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView } from "react-native";

interface SettingsPanelWrapperProps {
  children: ReactNode;
}

export function ContentViewWrapper({ children }: SettingsPanelWrapperProps) {
  return (
    <KeyboardAvoidingView behavior={PLATFORM.IS_IOS ? "padding" : "height"} className="flex-1">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
