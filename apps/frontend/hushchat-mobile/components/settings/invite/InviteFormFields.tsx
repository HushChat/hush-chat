import { AppText, AppTextInput } from "@/components/AppText";
import { View } from "react-native";
import React from "react";
import { IInvite } from "@/schema/invite";

interface InviteFormFieldProps {
  data: IInvite;
  onChangeField: (field: keyof IInvite, value: any) => void;
  onError: Record<string, string>;
}

export default function InviteFormFields({ data, onChangeField, onError }: InviteFormFieldProps) {
  return (
    <View className="mb-6">
      <AppText className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
        Email Address
      </AppText>

      <AppTextInput
        value={data.email}
        onChangeText={(value) => onChangeField("email", value)}
        placeholder="Enter email"
        placeholderTextColor="#9ca3af"
        autoCapitalize="none"
        keyboardType="email-address"
        className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-gray-900 dark:text-white"
      />
      {onError.email && <AppText className="text-red-500 text-sm mt-1">{onError.email}</AppText>}
    </View>
  );
}
