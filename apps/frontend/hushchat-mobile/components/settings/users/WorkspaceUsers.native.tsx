import React from "react";
import { ScrollView } from "react-native";
import { ContactUsFormFields } from "@/components/settings/contact/ContactUsFormFields";

export function WorkspaceUsers() {
  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
      <ContactUsFormFields />
    </ScrollView>
  );
}
