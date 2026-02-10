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
    <View className="bg-white dark:bg-gray-800/50 rounded-xl p-5">
      <AppText className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
        Change Password
      </AppText>

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
