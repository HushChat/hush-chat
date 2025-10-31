import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as Yup from "yup";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText, AppTextInput } from "@/components/AppText";
import { sendContactUsMessage } from "@/apis/conversation";
import { ToastUtils } from "@/utils/toastUtils";

const contactSchema = Yup.object({
  name: Yup.string().trim().required("Name is required"),
  email: Yup.string().trim().email("Invalid email").required("Email is required"),
  subject: Yup.string().trim().required("Subject is required"),
  message: Yup.string().trim().required("Message is required"),
});

interface ContactUsFormProps {
  initialName?: string;
  initialEmail?: string;
}

export function ContactUsForm({
  initialName = "",
  initialEmail = "",
}: ContactUsFormProps) {
  const [formData, setFormData] = useState({
    name: initialName,
    email: initialEmail,
    subject: "",
    message: "",
  });

  const mutation = useMutation({
    mutationFn: sendContactUsMessage,
    onSuccess: (response) => {
      ToastUtils.success(response.data || "Message sent successfully!");
      setFormData({
        name: initialName,
        email: initialEmail,
        subject: "",
        message: "",
      });
    },
    onError: (error: any) => {
      ToastUtils.error(error.response?.data?.error || error.message);
    },
  });

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      await contactSchema.validate(formData, { abortEarly: false });

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      };

      mutation.mutate(payload);
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        Alert.alert("Validation Error", error.errors[0]);
      }
    }
  };

  const isFormValid =
    formData.name.trim() &&
    formData.email.trim() &&
    formData.subject.trim() &&
    formData.message.trim();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: "flex-start",
          paddingHorizontal: 24,
          paddingTop: 10,
          paddingBottom: 60,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-4 mb-6">
          <View className="flex-row items-center">
            <Ionicons name="mail-outline" size={20} color="#6b7280" />
            <AppText className="text-text-primary-light dark:text-text-primary-dark ml-3 text-sm">
              gethushchat@gmail.com
            </AppText>
          </View>
        </View>

        <View className="space-y-4">
          <View>
            <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Name
            </AppText>
            <AppTextInput
              value={formData.name}
              onChangeText={(v) => handleChange("name", v)}
              placeholder="Your name"
              placeholderTextColor="#9ca3af"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
              editable={!mutation.isPending}
            />
          </View>

          <View>
            <AppText className="mt-5 text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Email
            </AppText>
            <AppTextInput
              value={formData.email}
              onChangeText={(v) => handleChange("email", v)}
              placeholder="your.email@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
              editable={!mutation.isPending}
            />
          </View>

          <View>
            <AppText className="mt-5 text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Subject
            </AppText>
            <AppTextInput
              value={formData.subject}
              onChangeText={(v) => handleChange("subject", v)}
              placeholder="What is this about?"
              placeholderTextColor="#9ca3af"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
              editable={!mutation.isPending}
            />
          </View>

          <View>
            <AppText className="mt-5 text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
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
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
              editable={!mutation.isPending}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
            disabled={!isFormValid || mutation.isPending}
            className={`rounded-lg py-4 items-center mt-5 ${
              !isFormValid || mutation.isPending
                ? "bg-gray-400"
                : "bg-primary-light dark:bg-primary-dark"
            }`}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#ffffff" size={20} />
            ) : (
              <AppText className="text-white font-semibold text-base">
                Send Message
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
