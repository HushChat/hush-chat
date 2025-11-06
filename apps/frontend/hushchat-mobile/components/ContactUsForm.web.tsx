import React from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText, AppTextInput } from "@/components/AppText";
import { useContactUsForm } from "@/hooks/useContactUsForm"; 
import { ContactUsInfo } from "@/types/chat/types";


export function ContactUsForm({
  initialName = "",
  initialEmail = "",
}: ContactUsInfo) {
  const {
    formData,
    errors,
    mutation,
    handleChange,
    handleSubmit,
    isFormValid,
  } = useContactUsForm({ 
    initialName, 
    initialEmail,
    onSuccessCallback: () => {
    }
  });

  const isPending = mutation.isPending;
  const isButtonDisabled = !isFormValid || isPending;

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

        {/* Form fields */}
        <View className="space-y-5">
          {[
            { label: "Name", key: "name", placeholder: "Your name" },
            {
              label: "Email",
              key: "email",
              placeholder: "your.email@example.com",
              keyboardType: "email-address",
            },
            { label: "Subject", key: "subject", placeholder: "What is this about?" },
          ].map(({ label, key, ...rest }) => (
            <View key={key}>
              <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                {label}
              </AppText>
              <AppTextInput
                value={formData[key as keyof typeof formData]}
                onChangeText={(v) => handleChange(key as keyof typeof formData, v)}
                placeholder={rest.placeholder}
                placeholderTextColor="#9ca3af"
                keyboardType={rest.keyboardType as any}
                autoCapitalize="none"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark w-full" 
                editable={!isPending}
              />
              {errors[key] && (
                <AppText className="text-red-500 text-xs mt-1">{errors[key]}</AppText>
              )}
            </View>
          ))}

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
