import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText, AppTextInput } from "@/components/AppText";
import { useContactUsForm } from "@/hooks/useContactUsForm";
import { useContactUsUploader } from "@/hooks/useContactUsUploader";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import BackButton from "@/components/BackButton";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { PLATFORM } from "@/constants/platformConstants";

export function ContactUsFormFields() {
  const { contactForm, submitContactForm, isPending } = useContactUsForm();
  const insets = useSafeAreaInsets();

  const {
    isUploading,
    uploads,
    pickAndUploadImages,
    pickAndUploadDocuments,
    removeFile,
    resetUploads,
  } = useContactUsUploader();

  const isBusy = isPending || isUploading;

  const handleSubmit = async () => {
    const attachmentPayload = uploads
      .filter((u) => u.success && u.indexedFileName)
      .map((u) => ({
        originalFileName: u.originalFileName || u.localFile.name,
        indexedFileName: u.indexedFileName!,
      }));

    await submitContactForm(attachmentPayload);
    resetUploads();
  };

  return (
    <View
      className="flex-1 bg-background-light dark:bg-background-dark"
      style={{ paddingTop: insets.top + 12 }}
    >
      <View className="flex-row items-center mb-2 px-4">
        {!PLATFORM.IS_WEB && <BackButton onPress={() => router.back()} />}
        <AppText className="text-2xl font-bold text-gray-900 dark:text-white leading-none">
          Contact Us
        </AppText>
      </View>

      <View className="px-4">
        <AppText className="text-gray-600 dark:text-gray-400 max-w-[600px] mb-6">
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
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark mb-4"
          editable={!isBusy}
        />
        {contactForm.errors.name && (
          <AppText className="text-red-500 text-xs mt-1 mb-2">{contactForm.errors.name}</AppText>
        )}

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
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark mb-4"
          editable={!isBusy}
        />

        {contactForm.errors.email && (
          <AppText className="text-red-500 text-xs mt-1 mb-2">{contactForm.errors.email}</AppText>
        )}

        {/* --- SUBJECT INPUT --- */}
        <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
          Subject
        </AppText>

        <AppTextInput
          value={contactForm.values.subject}
          onChangeText={(v) => contactForm.onValueChange({ name: "subject", value: v })}
          placeholder="What is this about?"
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark mb-4"
          editable={!isBusy}
        />
        {contactForm.errors.subject && (
          <AppText className="text-red-500 text-xs mt-1 mb-2">{contactForm.errors.subject}</AppText>
        )}
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
          editable={!isBusy}
        />

        {contactForm.errors.message && (
          <AppText className="text-red-500 text-xs mt-1">{contactForm.errors.message}</AppText>
        )}

        <View className="mt-6">
          <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Add Attachment
          </AppText>

          <View className="flex-row gap-3 mb-3">
            <TouchableOpacity
              onPress={pickAndUploadImages}
              disabled={isBusy}
              className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700"
            >
              <Ionicons name="image-outline" size={18} color={isBusy ? "gray" : "#4B5563"} />
              <AppText className="ml-2 text-sm text-gray-700 dark:text-gray-300">Image</AppText>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={pickAndUploadDocuments}
              disabled={isBusy}
              className="flex-row items-center bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md border border-gray-300 dark:border-gray-700"
            >
              <Ionicons
                name="document-text-outline"
                size={18}
                color={isBusy ? "gray" : "#4B5563"}
              />
              <AppText className="ml-2 text-sm text-gray-700 dark:text-gray-300">Document</AppText>
            </TouchableOpacity>
          </View>

          {uploads.length > 0 && (
            <View className="gap-2">
              {uploads.map((file, index) => (
                <View
                  key={index}
                  className="flex-row items-center justify-between bg-gray-50 dark:bg-gray-900 p-2 rounded border border-gray-200 dark:border-gray-700"
                >
                  <View className="flex-row items-center flex-1 pr-2">
                    {file.success ? (
                      <Ionicons name="checkmark-circle" size={20} color="#10B981" />
                    ) : file.error ? (
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    ) : (
                      <ActivityIndicator size="small" color="#6B7280" />
                    )}
                    <AppText
                      className="ml-2 text-sm text-gray-700 dark:text-gray-300 truncate"
                      numberOfLines={1}
                    >
                      {file.localFile.name}
                    </AppText>
                  </View>
                  <TouchableOpacity
                    onPress={() => removeFile(file.localFile.uri)}
                    disabled={isBusy}
                  >
                    <Ionicons name="close" size={18} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          activeOpacity={DEFAULT_ACTIVE_OPACITY}
          disabled={isBusy}
          className={`rounded-lg py-4 items-center mt-8 mb-10 ${
            isBusy ? "bg-gray-300 dark:bg-gray-700" : "bg-primary-light dark:bg-primary-dark"
          }`}
        >
          {isBusy ? (
            <ActivityIndicator color="#ffffff" size={20} />
          ) : (
            <AppText className="text-white font-semibold text-base">Send Message</AppText>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}
