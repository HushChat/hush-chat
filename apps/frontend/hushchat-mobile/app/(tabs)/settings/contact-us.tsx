import React from "react";
import { View } from "react-native";
import { ContactUsForm } from "@/components/ContactUsForm";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ContactUsPage() {
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <ContactUsForm />
      </View>
    </SafeAreaView>
  );
}