import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText, AppTextInput } from "@/components/AppText";
import { useContactUsForm } from "@/hooks/useContactUsForm";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import BackButton from "@/components/BackButton";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PLATFORM } from "@/constants/platformConstants";

export function ContactUsFormFields() {
  const { contactForm, submitContactForm, isPending, isSubmitButtonDisabled } = useContactUsForm();

  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center mb-2">
        {!PLATFORM.IS_WEB && <BackButton onPress={() => router.back()} />}
        <AppText className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
          Contact Us
        </AppText>
      </View>

      <AppText className="text-gray-600 dark:text-gray-400 max-w-[600px]">
        Have a question or feedback? We would love to hear from you.
      </AppText>

      <View className="bg-gray-200 dark:bg-gray-800 rounded-xl p-4 mb-6 mt-6">
        <View className="flex-row items-center">
          <Ionicons name="mail-outline" size={20} color="#6b7280" />
          <AppText className="text-text-primary-light dark:text-text-primary-dark ml-3 text-sm">
            gethushchat@gmail.com
          </AppText>
        </View>
      </View>

      <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
        Name
      </AppText>

      <AppTextInput
        value={contactForm.values.name}
        onChangeText={(v) => contactForm.onValueChange({ name: "name", value: v })}
        placeholder="Your name"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
        editable={!isPending}
      />

      {contactForm.errors.name && (
        <AppText className="text-red-500 text-xs mt-1">{contactForm.errors.name}</AppText>
      )}

      <View className="mt-4">
        <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
          Email
        </AppText>

        <AppTextInput
          value={contactForm.values.email}
          onChangeText={(v) => contactForm.onValueChange({ name: "email", value: v })}
          placeholder="your.email@example.com"
          placeholderTextColor="#9ca3af"
          keyboardType="email-address"
          autoCapitalize="none"
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
          editable={!isPending}
        />

        {contactForm.errors.email && (
          <AppText className="text-red-500 text-xs mt-1">{contactForm.errors.email}</AppText>
        )}
      </View>

      <View className="mt-4">
        <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
          Subject
        </AppText>

        <AppTextInput
          value={contactForm.values.subject}
          onChangeText={(v) => contactForm.onValueChange({ name: "subject", value: v })}
          placeholder="What is this about?"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
          editable={!isPending}
        />

        {contactForm.errors.subject && (
          <AppText className="text-red-500 text-xs mt-1">{contactForm.errors.subject}</AppText>
        )}
      </View>

      <View className="mt-4">
        <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
          Message
        </AppText>

        <AppTextInput
          value={contactForm.values.message}
          onChangeText={(v) => contactForm.onValueChange({ name: "message", value: v })}
          placeholder="Tell us more..."
          placeholderTextColor="#9ca3af"
          multiline
          numberOfLines={6}
          textAlignVertical="top"
          style={{ minHeight: 120 }}
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
          editable={!isPending}
        />

        {contactForm.errors.message && (
          <AppText className="text-red-500 text-xs mt-1">{contactForm.errors.message}</AppText>
        )}
      </View>

      <TouchableOpacity
        onPress={submitContactForm}
        activeOpacity={DEFAULT_ACTIVE_OPACITY}
        disabled={isSubmitButtonDisabled}
        className={`rounded-lg py-4 items-center mt-5 ${
          isSubmitButtonDisabled
            ? "bg-gray-300 dark:bg-gray-700"
            : "bg-primary-light dark:bg-primary-dark"
        }`}
      >
        {isPending ? (
          <ActivityIndicator color="#ffffff" size={20} />
        ) : (
          <AppText className="text-white font-semibold text-base">Send Message</AppText>
        )}
      </TouchableOpacity>
    </View>
  );
}
