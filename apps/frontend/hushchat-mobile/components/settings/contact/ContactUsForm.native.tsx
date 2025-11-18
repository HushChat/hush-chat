import React from "react";
import { KeyboardAvoidingView, ScrollView, Platform } from "react-native";
import { ContactUsFormFields } from "@/components/settings/contact/ContactUsFormFields";

export function ContactUsForm() {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
        <ContactUsFormFields />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
