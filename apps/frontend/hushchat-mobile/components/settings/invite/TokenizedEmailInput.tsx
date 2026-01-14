import { AppText } from "@/components/AppText";
import { View, TouchableOpacity } from "react-native";
import TokenizedInputBase from "@/components/TokenizedInput";
import { EMAIL_REGEX } from "@/constants/regex";

interface TokenizedEmailInputProps {
  value: string[];
  onChange: (emails: string[]) => void;
  error?: string;
  max?: number;
  placeholder?: string;
}

export default function TokenizedEmailInput({
  value = [],
  onChange,
  error,
  max = 100,
  placeholder = "Enter email addresses...",
}: TokenizedEmailInputProps) {
  const parseEmailInput = (text: string): string[] =>
    text
      .split(/[\s,;]+/)
      .map((e) => e.trim())
      .filter(Boolean);

  const isValidEmail = (email: string) => EMAIL_REGEX.test(email.toLowerCase());

  const renderEmailToken = (email: string, onRemove: () => void) => (
    <View className="flex-row items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3 py-1.5 mr-2 mb-2">
      <AppText className="text-sm text-gray-800 dark:text-gray-200">{email}</AppText>
      <TouchableOpacity onPress={onRemove} hitSlop={8} className="ml-2">
        <AppText className="text-red-500 text-base font-bold">×</AppText>
      </TouchableOpacity>
    </View>
  );

  return (
    <TokenizedInputBase<string>
      value={value}
      onChange={onChange}
      renderToken={renderEmailToken}
      parseInput={parseEmailInput}
      isValid={isValidEmail}
      getKey={(email) => email.toLowerCase()}
      placeholder={placeholder}
      keyboardType="email-address"
      error={error}
      max={max}
    />
  );
}
