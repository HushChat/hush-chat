import React, { useState } from "react";
import { View, TouchableOpacity, ActivityIndicator } from "react-native";
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
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      setErrors({});
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
      setErrors({});

      mutation.mutate({
        name: formData.name.trim(),
        email: formData.email.trim(),
        subject: formData.subject.trim(),
        message: formData.message.trim(),
      });
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((e) => {
          if (e.path) validationErrors[e.path] = e.message;
        });
        setErrors(validationErrors);
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
            <Ionicons name="mail-outline" size={20} color="#6b7280" />
            <AppText className="text-text-primary-light dark:text-text-primary-dark ml-3">
              gethushchat@gmail.com
            </AppText>
          </View>
        </View>

        <View className="space-y-5">
          {[
            { label: 'Name', key: 'name', placeholder: 'Your name' },
            {
              label: 'Email',
              key: 'email',
              placeholder: 'your.email@example.com',
              keyboardType: 'email-address',
            },
            { label: 'Subject', key: 'subject', placeholder: 'What is this about?' },
          ].map(({ label, key, ...rest }) => (
            <View key={key}>
              <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2 mt-4">
                {label}
              </AppText>
              <AppTextInput
                value={formData[key as keyof typeof formData]}
                onChangeText={(value) => handleChange(key as keyof typeof formData, value)}
                placeholder={rest.placeholder}
                placeholderTextColor="#9ca3af"
                keyboardType={rest.keyboardType as any}
                autoCapitalize="none"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
                editable={!mutation.isPending}
              />
              {errors[key] && (
                <AppText className="text-red-500 text-xs mt-1">{errors[key]}</AppText>
              )}
            </View>
          ))}

          <View>
            <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2 mt-5">
              Message
            </AppText>
            <AppTextInput
              value={formData.message}
              onChangeText={(value) => handleChange('message', value)}
              placeholder="Tell us more..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              style={{ minHeight: 120 }}
              className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
              editable={!mutation.isPending}
            />
            {errors.message && (
              <AppText className="text-red-500 text-xs mt-1">{errors.message}</AppText>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSubmit}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
            disabled={!isFormValid || mutation.isPending}
            className={`rounded-lg py-4 items-center mt-3 ${
              !isFormValid || mutation.isPending
                ? 'bg-gray-300 dark:bg-gray-700'
                : 'bg-primary-light dark:bg-primary-dark'
            }`}
          >
            {mutation.isPending ? (
              <ActivityIndicator color="#ffffff" size={20} />
            ) : (
              <AppText
                className={`text-base ${
                  !isFormValid || mutation.isPending
                    ? 'text-gray-500 dark:text-gray-400'
                    : 'text-white'
                }`}
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
