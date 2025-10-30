import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useMutation } from "@tanstack/react-query";
import * as Yup from "yup";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText, AppTextInput } from "@/components/AppText";
import { sendContactUsMessage } from "@/apis/conversation";
import { ToastUtils } from "@/utils/toastUtils";

const contactSchema = Yup.object().shape({
  name: Yup.string().trim().required("Name is required"),
  email: Yup.string()
    .trim()
    .email("Invalid email")
    .required("Email is required"),
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
      ToastUtils.success(response.data);
      setFormData((prev) => ({
        ...prev,
        subject: "",
        message: "",
      }));
    },
    onError: (error: any) => {
      ToastUtils.error(error.response?.data?.error || error.message);
    },
  });

  const handleFieldChange = (field: keyof typeof formData, value: string) => {
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
    <View className="flex-1 justify-center">
      <View className="w-full max-w-2xl mx-auto">
        <View className="bg-gray-100 dark:bg-gray-800 rounded-xl p-6 mb-6">
          <View className="flex-row items-center">
            <Ionicons name="mail" size={20} color="#6b7280" />
            <AppText className="text-text-primary-light dark:text-text-primary-dark ml-3">
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
              onChangeText={(value) => handleFieldChange("name", value)}
              placeholder="Your name"
              placeholderTextColor="#9ca3af"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
              editable={!mutation.isPending}
            />
          </View>

          <View>
            <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Email
            </AppText>
            <AppTextInput
              value={formData.email}
              onChangeText={(value) => handleFieldChange("email", value)}
              placeholder="your.email@example.com"
              placeholderTextColor="#9ca3af"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
              editable={!mutation.isPending}
            />
          </View>

          <View>
            <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Subject
            </AppText>
            <AppTextInput
              value={formData.subject}
              onChangeText={(value) => handleFieldChange("subject", value)}
              placeholder="What is this about?"
              placeholderTextColor="#9ca3af"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
              editable={!mutation.isPending}
            />
          </View>

          <View>
            <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
              Message
            </AppText>
            <AppTextInput
              value={formData.message}
              onChangeText={(value) => handleFieldChange("message", value)}
              placeholder="Tell us more..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
              style={{ minHeight: 120 }}
              editable={!mutation.isPending}
            />
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
            disabled={!isFormValid || mutation.isPending}
            className={`rounded-lg py-4 items-center mt-2 ${
              !isFormValid || mutation.isPending
                ? "bg-gray-400"
                : "bg-primary-light dark:bg-primary-dark"
            }`}
          >
            {mutation.isPending ? (
              <ActivityIndicator size={20} />
            ) : (
              <AppText className="font-semibold text-base">
                Send Message
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
