import React from "react";
import { View } from "react-native";
import { ContactUsFormFields } from "./ContactUsFormFields";

export function ContactUsForm() {
  return (
    <View className="flex-1 p-6">
      <ContactUsFormFields />
    </View>
  );
}
