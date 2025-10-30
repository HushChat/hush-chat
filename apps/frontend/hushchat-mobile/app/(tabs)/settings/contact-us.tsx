import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DEFAULT_ACTIVE_OPACITY } from '@/constants/ui';
import { AppText, AppTextInput } from '@/components/AppText';
import { useUserStore } from '@/store/user/useUserStore';
import { sendContactUsMessage } from '@/apis/conversation';
import { ToastUtils } from '@/utils/toastUtils';

export default function ContactUsPage() {
  const { user } = useUserStore();
  const [name, setName] = useState(user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}` : '');
  const [email, setEmail] = useState(user?.email || '');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    const payload = {
      name: name.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
    };

    if (!payload.name || !payload.email || !payload.subject || !payload.message) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    const { data, error } = await sendContactUsMessage(payload);

    setIsSubmitting(false);

    if (error) {
      ToastUtils.error(error); 
      return;
    }

    ToastUtils.success(data); 

    setSubject('');
    setMessage('');
  };


  const isFormValid = name.trim() && email.trim() && subject.trim() && message.trim();

  return (
    <ScrollView className="flex-1 bg-background-light dark:bg-background-dark">
      <View className="mb-6 px-8 py-6">
            <AppText className="text-3xl font-bold text-text-primary-light dark:text-text-primary-dark mb-2">
              Contact Us
            </AppText>
            <AppText className="text-gray-600 dark:text-gray-400">
              Have a question or feedback? We would love to hear from you.
            </AppText>
          </View>
      <View className="px-8 py-6 items-center">
        <View className="w-full max-w-2xl">
          <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 mb-6">
            <View className="flex-row items-center mb-4">
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
                value={name}
                onChangeText={setName}
                placeholder="Your name"
                placeholderTextColor="#9ca3af"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
                editable={!isSubmitting}
              />
            </View>

            <View>
              <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Email
              </AppText>
              <AppTextInput
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
                editable={!isSubmitting}
              />
            </View>

            <View>
              <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Subject
              </AppText>
              <AppTextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="What is this about?"
                placeholderTextColor="#9ca3af"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
                editable={!isSubmitting}
              />
            </View>

            <View>
              <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
                Message
              </AppText>
              <AppTextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Tell us more..."
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-text-primary-light dark:text-text-primary-dark"
                style={{ minHeight: 120 }}
                editable={!isSubmitting}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={DEFAULT_ACTIVE_OPACITY}
              disabled={!isFormValid || isSubmitting}
              className={`rounded-lg py-4 items-center mt-2 ${
                !isFormValid || isSubmitting ? 'bg-gray-400' : 'bg-primary-light dark:bg-primary-dark'
              }`}
            >
              {isSubmitting ? (
                <ActivityIndicator size={20} color="#ffffff" />
              ) : (
                <AppText className="text-white text-base font-semibold">
                  Send Message
                </AppText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}