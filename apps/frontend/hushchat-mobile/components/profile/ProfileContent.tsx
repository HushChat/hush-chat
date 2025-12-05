import React from "react";
import { View, ScrollView, ActivityIndicator } from "react-native";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileField } from "./ProfileField";
import { PasswordSection } from "./PasswordSection";
import { ProfileActions } from "./ProfileActions";
import { profileStyles } from "@/components/profile/profile.styles";
import { PROFILE_COLORS } from "@/components/profile/profile.constants";

interface ProfileContentProps {
  user: {
    firstName: string;
    lastName: string;
    email: string;
    signedImageUrl?: string;
  };
  formValues: {
    firstName: string;
    lastName: string;
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  };
  formErrors?: {
    firstName?: string;
    lastName?: string;
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
  avatarProps: {
    imageUri?: string | null;
    uploading: boolean;
    imageError: boolean;
    onPress: () => void;
    onImageError: () => void;
  };
  actionProps: {
    onUpdate: () => void;
    onLogout: () => void;
    isUpdateDisabled: boolean;
    isLoading: boolean;
  };
}

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900">
      <ActivityIndicator size="large" color={PROFILE_COLORS.BLUE_500} />
    </View>
  );
}

export function ProfileContent({
  user,
  formValues,
  formErrors,
  showErrors,
  onValueChange,
  passwordVisibility,
  avatarProps,
  actionProps,
}: ProfileContentProps) {
  const userName = `${user.firstName} ${user.lastName}`;

  return (
    <ScrollView contentContainerStyle={profileStyles.scrollContent} className="custom-scrollbar">
      {/* Avatar Section */}
      <View className="mt-8 px-4">
        <ProfileAvatar
          imageUri={avatarProps.imageUri}
          signedImageUrl={user.signedImageUrl}
          userName={userName}
          uploading={avatarProps.uploading}
          imageError={avatarProps.imageError}
          onPress={avatarProps.onPress}
          onImageError={avatarProps.onImageError}
        />
      </View>

      {/* Profile Fields Section */}
      <View className="mt-10 px-4">
        <View className="max-w-3xl w-full mx-auto">
          <ProfileField
            label="First Name"
            name="firstName"
            value={formValues.firstName}
            editable
            onValueChange={onValueChange}
            placeholder="Enter first name"
            error={formErrors?.firstName}
            showError={showErrors}
          />

          <ProfileField
            label="Last Name"
            name="lastName"
            value={formValues.lastName}
            editable
            onValueChange={onValueChange}
            placeholder="Enter last name"
            error={formErrors?.lastName}
            showError={showErrors}
          />

          <ProfileField label="Email" value={user.email} />

          {/* Password Section */}
          <PasswordSection
            formValues={formValues}
            formErrors={formErrors}
            showErrors={showErrors}
            onValueChange={onValueChange}
            passwordVisibility={passwordVisibility}
          />
        </View>
      </View>

      {/* Action Buttons */}
      <ProfileActions {...actionProps} />
    </ScrollView>
  );
}
