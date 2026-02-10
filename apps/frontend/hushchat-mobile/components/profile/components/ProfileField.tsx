import React from "react";
import { View, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText, AppTextInput } from "@/components/AppText";
import { PLATFORM } from "@/constants/platformConstants";

export type TProfileFieldName =
  | "firstName"
  | "lastName"
  | "currentPassword"
  | "newPassword"
  | "confirmPassword";

export interface IProfileFieldProps {
  label: string;
  name?: TProfileFieldName;
  value?: string | null;
  editable?: boolean;
  onValueChange?: (args: { name: string; value: string }) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
  error?: string;
  showError?: boolean;
}

const PROFILE_COLORS = {
  PLACEHOLDER: "#9ca3af",
} as const;

const ICON_SIZE = 20;

const getInputPlatformStyles = (isWeb: boolean) => ({
  backgroundColor: "transparent",
  ...(isWeb ? { outlineWidth: 0 } : {}),
});

export function ProfileField({
  label,
  name,
  value,
  editable = false,
  onValueChange,
  placeholder,
  secureTextEntry = false,
  rightIcon,
  onRightIconPress,
  error,
  showError = true,
}: IProfileFieldProps) {
  const shouldShowError = showError && error;
  const isEditable = editable && onValueChange && name;

  const handleTextChange = (text: string) => {
    if (onValueChange && name) {
      onValueChange({ name, value: text });
    }
  };

  return (
    <View className="mb-4">
      <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
        {label}
      </AppText>

      {isEditable ? (
        <View className="relative">
          <AppTextInput
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3 text-base text-text-primary-light dark:text-text-primary-dark"
            value={value || ""}
            onChangeText={handleTextChange}
            placeholder={placeholder}
            placeholderTextColor={PROFILE_COLORS.PLACEHOLDER}
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            style={getInputPlatformStyles(PLATFORM.IS_WEB)}
          />
          {rightIcon && (
            <TouchableOpacity
              onPress={onRightIconPress}
              className="absolute top-1/2 -translate-y-1/2 right-4"
            >
              <Ionicons
                name={rightIcon as any}
                size={ICON_SIZE}
                color={PROFILE_COLORS.PLACEHOLDER}
              />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View className="bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
          <AppText className="text-base text-gray-600 dark:text-gray-400">
            {value || "Not provided"}
          </AppText>
        </View>
      )}

      {shouldShowError && <AppText className="text-red-500 text-xs mt-1">{error}</AppText>}
    </View>
  );
}
