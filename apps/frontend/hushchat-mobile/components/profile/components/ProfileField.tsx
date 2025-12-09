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
    <View className="mb-6 border-b border-gray-600 pb-2">
      <AppText className="text-sm text-gray-400 mb-1">{label}</AppText>

      {isEditable ? (
        <View className="flex-row items-center">
          <AppTextInput
            className="text-base dark:text-white text-black py-1 flex-1"
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
        <AppText className="text-base dark:text-white text-black">
          {value || "Not provided"}
        </AppText>
      )}

      {shouldShowError && <AppText className="text-red-500 text-xs mt-1">{error}</AppText>}
    </View>
  );
}
