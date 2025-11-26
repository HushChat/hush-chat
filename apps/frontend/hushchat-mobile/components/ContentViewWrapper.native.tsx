import React, { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView, Platform } from "react-native";

interface SettingsPanelWrapperProps {
  children: ReactNode;
}

export function ContentViewWrapper({ children }: SettingsPanelWrapperProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
