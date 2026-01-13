import { AppText, AppTextInput } from "@/components/AppText";
import { View, TouchableOpacity } from "react-native";
import React from "react";

interface InviteFormFieldProps {
  email: string;
  index: number;
  onRemove: (index: number) => void;
  onChangeEmail: (index: number, value: string) => void;
  error?: string;
}

export default function InviteFormFields({
  email,
  index,
  onRemove,
  onChangeEmail,
  error,
}: InviteFormFieldProps) {
  return (
    <View className="mb-4">
      <View className="flex-row justify-between items-center mb-2">
        <AppText className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Email Address {index + 1}
        </AppText>
        {index > 0 && (
          <TouchableOpacity onPress={() => onRemove(index)}>
            <AppText className="text-red-500 text-sm">Remove</AppText>
          </TouchableOpacity>
        )}
      </View>

      <AppTextInput
        value={email}
        onChangeText={(value) => onChangeEmail(index, value)}
        placeholder="Enter email"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        keyboardType="email-address"
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
      />
      {error && <AppText className="text-red-500 text-sm mt-1">{error}</AppText>}
    </View>
  );
}
