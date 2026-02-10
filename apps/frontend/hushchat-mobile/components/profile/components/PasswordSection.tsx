import React from "react";
import { View } from "react-native";
import { AppText } from "@/components/AppText";
import { ProfileField } from "./ProfileField";
import { PasswordRequirements } from "./PasswordRequirements";

interface IPasswordSectionProps {
  formValues: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  formErrors?: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  showErrors: boolean;
  onValueChange: (args: { name: string; value: string }) => void;
  passwordVisibility: {
    showCurrentPassword: boolean;
    showNewPassword: boolean;
    showConfirmPassword: boolean;
    toggleCurrentPassword: () => void;
    toggleNewPassword: () => void;
    toggleConfirmPassword: () => void;
    getIconName: (isVisible: boolean) => string;
  };
}

export function PasswordSection({
  formValues,
  formErrors,
  showErrors,
  onValueChange,
  passwordVisibility,
}: IPasswordSectionProps) {
  const {
    showCurrentPassword,
    showNewPassword,
    showConfirmPassword,
    toggleCurrentPassword,
    toggleNewPassword,
    toggleConfirmPassword,
    getIconName,
  } = passwordVisibility;

  return (
    <View className="mt-2">
      <View className="border-t border-gray-200 dark:border-gray-700 pt-6 mb-4">
        <AppText className="text-lg font-bold text-gray-900 dark:text-white mb-1">
          Change Password
        </AppText>
        <AppText className="text-sm text-gray-500 dark:text-gray-400">
          Update your password to keep your account secure
        </AppText>
      </View>

      <ProfileField
        label="Current Password"
        name="currentPassword"
        value={formValues.currentPassword}
        editable
        secureTextEntry={!showCurrentPassword}
        onValueChange={onValueChange}
        rightIcon={getIconName(showCurrentPassword)}
        onRightIconPress={toggleCurrentPassword}
        error={formErrors?.currentPassword}
        showError={showErrors}
      />

      <ProfileField
        label="New Password"
        name="newPassword"
        value={formValues.newPassword}
        editable
        secureTextEntry={!showNewPassword}
        onValueChange={onValueChange}
        rightIcon={getIconName(showNewPassword)}
        onRightIconPress={toggleNewPassword}
        error={formErrors?.newPassword}
        showError={showErrors}
      />

      <ProfileField
        label="Confirm New Password"
        name="confirmPassword"
        value={formValues.confirmPassword}
        editable
        secureTextEntry={!showConfirmPassword}
        onValueChange={onValueChange}
        rightIcon={getIconName(showConfirmPassword)}
        onRightIconPress={toggleConfirmPassword}
        error={formErrors?.confirmPassword}
        showError={showErrors}
      />

      <PasswordRequirements password={formValues.newPassword} />
    </View>
  );
}
