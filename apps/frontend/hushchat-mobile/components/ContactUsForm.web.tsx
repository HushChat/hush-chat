import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText, AppTextInput } from "@/components/AppText";
import { useContactUsForm } from "@/hooks/useContactUsForm";

export function ContactUsForm() {
  const {
    formData,
    errors,
    handleChange,
    handleSubmit,
    isPending,
    isButtonDisabled,
  } = useContactUsForm({ 
    onSuccessCallback: () => {
    }
  });

  return (
    <View className="flex-1 justify-start"> 
      <View className="w-full">
        <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 sm:p-6 mb-6">
          <View className="flex-row items-center flex-wrap">
            <Ionicons name="mail-outline" size={20} color="#6b7280" />
            <AppText
              className="ml-2 text-sm sm:text-base text-text-primary-light dark:text-text-primary-dark flex-shrink"
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              gethushchat@gmail.com
            </AppText>
          </View>
        </View>

        <View className="space-y-5">
          <View>
            <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Name
            </AppText>
            <AppTextInput
              value={formData.name}
              onChangeText={(v) => handleChange("name", v)}
              placeholder="Your name"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark w-full" 
              editable={!isPending}
            />
            {errors.name && (
              <AppText className="text-red-500 text-xs mt-1">{errors.name}</AppText>
            )}
          </View>

          <View>
            <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Email
            </AppText>
            <AppTextInput
              value={formData.email}
              onChangeText={(v) => handleChange("email", v)}
              placeholder="your.email@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark w-full" 
              editable={!isPending}
            />
            {errors.email && (
              <AppText className="text-red-500 text-xs mt-1">{errors.email}</AppText>
            )}
          </View>

          <View>
            <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Subject
            </AppText>
            <AppTextInput
              value={formData.subject}
              onChangeText={(v) => handleChange("subject", v)}
              placeholder="What is this about?"
              placeholderTextColor="#9ca3af"
              autoCapitalize="none"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark w-full" 
              editable={!isPending}
            />
            {errors.subject && (
              <AppText className="text-red-500 text-xs mt-1">{errors.subject}</AppText>
            )}
          </View>

          <View>
            <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Message
            </AppText>
            <AppTextInput
              value={formData.message}
              onChangeText={(v) => handleChange("message", v)}
              placeholder="Tell us more..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={{ minHeight: 120 }}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark w-full"
              editable={!isPending}
            />
            {errors.message && (
              <AppText className="text-red-500 text-xs mt-1">{errors.message}</AppText>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
            disabled={isButtonDisabled}
            className={`rounded-lg py-4 items-center mt-3 w-full ${
              isButtonDisabled
                ? "bg-gray-300 dark:bg-gray-700"
                : "bg-primary-light dark:bg-primary-dark"
            }`}
          >
            {isPending ? (
              <ActivityIndicator color="#ffffff" size={20} />
            ) : (
              <AppText
                numberOfLines={1}
                adjustsFontSizeToFit
                className={`text-base font-semibold ${
                  isButtonDisabled
                    ? "text-gray-500 dark:text-gray-400"
                    : "text-white"
                }`}
                style={{
                  textAlign: "center",
                  flexShrink: 1,
                  width: "100%",
                }}
              >
                Send Message
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
