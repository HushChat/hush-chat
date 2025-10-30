import React from "react";
import { View, KeyboardAvoidingView, Platform } from "react-native";
import { AppText } from "@/components/AppText";
import { useUserStore } from "@/store/user/useUserStore";
import { ContactUsForm } from "@/components/ContactUsForm";

export default function ContactUsPage() {
  const { user } = useUserStore();

  const initialName =
    user?.firstName && user?.lastName
      ? `${user.firstName} ${user.lastName}`
      : "";
  const initialEmail = user?.email || "";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 bg-background-light dark:bg-background-dark"
    >
      <View className="flex-1 px-8 py-6">
        <View className="mb-6">
          <AppText className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
            Contact Us
          </AppText>
          <AppText className="text-gray-600 dark:text-gray-400">
            Have a question or feedback? We would love to hear from you.
          </AppText>
        </View>

        <ContactUsForm initialName={initialName} initialEmail={initialEmail} />
      </View>
    </KeyboardAvoidingView>
  );
}
