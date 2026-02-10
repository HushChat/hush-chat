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
  CAMERA_BG: "#3b82f6",
  WHITE: "#ffffff",
  PLACEHOLDER: "#9ca3af",
  BLUE_500: "#3b82f6",
} as const;

const PROFILE_SIZES = {
  AVATAR: {
    WIDTH: 160,
    HEIGHT: 160,
    BORDER_RADIUS: 80,
  },
  CAMERA_ICON: 18,
  PASSWORD_ICON: 20,
  SCROLL_CONTENT_PADDING_BOTTOM: 40,
  MIN_DESKTOP_WIDTH: 900,
  SIDEBAR_MAX_WIDTH: 460,
} as const;

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
        <View className="flex-row items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3">
          <AppTextInput
            className="text-base text-text-primary-light dark:text-text-primary-dark flex-1"
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
            <TouchableOpacity onPress={onRightIconPress} className="ml-2">
              <Ionicons
                name={rightIcon as any}
                size={PROFILE_SIZES.PASSWORD_ICON}
                color={PROFILE_COLORS.PLACEHOLDER}
              />
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View className="bg-gray-100 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-3">
          <AppText className="text-base text-text-primary-light dark:text-text-primary-dark">
            {value || "Not provided"}
          </AppText>
        </View>
      )}

      {shouldShowError && <AppText className="text-red-500 text-xs mt-1">{error}</AppText>}
    </View>
  );
}
