import React, { useState, useEffect } from "react";
import {
  View,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "@/store/user/useUserStore";
import { router } from "expo-router";
import { useAuthStore } from "@/store/auth/authStore";
import InitialsAvatar from "@/components/InitialsAvatar";
import { Images } from "@/assets/images";
import Placeholder from "@/components/Placeholder";
import { PLATFORM } from "@/constants/platformConstants";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { AUTH_LOGIN_PATH } from "@/constants/routes";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText, AppTextInput } from "@/components/AppText";
import { passwordRules } from "@/utils/passwordRules";
import { useProfileForm } from "@/hooks/useProfileForm";
import UploadIndicator from "@/components/UploadIndicator";

const COLORS = {
  CAMERA_BG: "#3b82f6",
  WHITE: "#ffffff",
};

type ProfileFieldProps = {
  label: string;
  name?: string;
  value?: string | null;
  editable?: boolean;
  onValueChange?: (args: { name: string; value: string }) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
  error?: string;
  showError?: boolean;
};

const ProfileField = ({
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
}: ProfileFieldProps) => {
  const shouldShowError = showError && error;

  return (
    <View className="mb-6 border-b border-gray-600 pb-2">
      <AppText className="text-sm text-gray-400 mb-1">{label}</AppText>
      {editable && onValueChange && name ? (
        <View className="flex-row items-center">
          <AppTextInput
            className="text-base dark:text-white text-black py-1 flex-1"
            value={value || ""}
            onChangeText={(text) => onValueChange({ name, value: text })}
            placeholder={placeholder}
            placeholderTextColor="#9ca3af"
            secureTextEntry={secureTextEntry}
            autoCapitalize="none"
            underlineColorAndroid="transparent"
            style={{
              backgroundColor: "transparent",
              ...(PLATFORM.IS_WEB ? { outlineWidth: 0 } : {}),
            }}
          />
          {rightIcon && (
            <TouchableOpacity onPress={onRightIconPress} className="ml-2">
              <Ionicons name={rightIcon as any} size={20} color="#9ca3af" />
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
};

export default function Profile() {
  const { logout } = useAuthStore();
  const { user, loading } = useUserStore();
  const isMobile = !PLATFORM.IS_WEB;
  const queryClient = useQueryClient();

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    formValues,
    formErrors,
    showErrors,
    onValueChange,
    submit,
    isLoading,
    uploading,
    imageError,
    setImageError,
    imagePickerResult,
    uploadImageResult,
    syncUserData,
    hasPasswordData,
    isProfileChanged,
  } = useProfileForm();

  // Sync form with user data when user changes
  useEffect(() => {
    syncUserData();
  }, [user?.id, syncUserData]);

  const handleLogout = async () => {
    queryClient.clear();
    await logout();
    // ⚠️ Temporary workaround: Wait for storage to finish properly before navigating
    await new Promise((resolve) => setTimeout(resolve, 300));
    router.replace(AUTH_LOGIN_PATH);
  };

  const toggleCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const renderPasswordRequirements = () => {
    if (!formValues.newPassword) return null;

    return (
      <View className="mb-6">
        <AppText className="text-xs text-gray-500 mb-2">Password Requirements:</AppText>
        <View>
          {passwordRules.map((rule, index) => {
            const passed = rule.test(formValues.newPassword);
            return (
              <AppText
                key={index}
                className={`text-xs ${passed ? "text-green-500" : "text-red-500"}`}
              >
                • {rule.text}
              </AppText>
            );
          })}
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const isUpdateButtonDisabled = isLoading || (!isProfileChanged && !hasPasswordData);

  const profileContent = (
    <ScrollView contentContainerStyle={styles.scrollContent} className="custom-scrollbar">
      <View className="mt-8 px-4">
        <View className="items-center py-10 rounded-3xl max-w-3xl w-full mx-auto dark:bg-background-dark light:bg-secondary-light">
          <TouchableOpacity
            onPress={uploadImageResult}
            disabled={uploading}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
          >
            <View style={styles.avatarContainer}>
              {imagePickerResult?.assets?.[0]?.uri ? (
                <Image
                  source={{ uri: imagePickerResult.assets[0].uri }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : user.signedImageUrl && !imageError ? (
                <Image
                  source={{ uri: user.signedImageUrl }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <InitialsAvatar name={`${user.firstName} ${user.lastName}`} size="lg" />
              )}

              <UploadIndicator isUploading={uploading} />

              <View style={styles.cameraIconContainer}>
                <Ionicons name="camera" size={18} color="#fff" />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>

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
          <ProfileField label="Email" value={user?.email} />

          <View className="mt-6">
            <AppText className="text-lg dark:text-white font-semibold mb-4">
              Change Password
            </AppText>

            <ProfileField
              label="Current Password"
              name="currentPassword"
              value={formValues.currentPassword}
              editable
              secureTextEntry={!showCurrentPassword}
              onValueChange={onValueChange}
              rightIcon={showCurrentPassword ? "eye-off" : "eye"}
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
              rightIcon={showNewPassword ? "eye-off" : "eye"}
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
              rightIcon={showConfirmPassword ? "eye-off" : "eye"}
              onRightIconPress={toggleConfirmPassword}
              error={formErrors?.confirmPassword}
              showError={showErrors}
            />

            {renderPasswordRequirements()}
          </View>
        </View>
      </View>

      <View className="mt-6 px-4">
        <View className="max-w-3xl w-full mx-auto">
          <TouchableOpacity
            onPress={submit}
            disabled={isUpdateButtonDisabled}
            className={`py-4 rounded-xl items-center mb-3 ${
              !isUpdateButtonDisabled ? "bg-blue-500" : "bg-gray-400"
            }`}
          >
            {isLoading ? (
              <ActivityIndicator size={20} color="#ffffff" />
            ) : (
              <AppText className="text-white text-base font-semibold">Update</AppText>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isLoading}
            className="bg-red-500 py-4 rounded-xl items-center"
          >
            <AppText className="text-white text-base font-semibold">Logout</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {isMobile ? (
        profileContent
      ) : (
        <ScrollView
          horizontal={true}
          style={{ flex: 1 }}
          className="custom-scrollbar"
          contentContainerStyle={{ flexGrow: 1, minWidth: 900 }}
          showsHorizontalScrollIndicator={true}
        >
          <View className="flex-1 flex-row">
            <View className="w-full max-w-[460px] border-r border-gray-200 dark:border-gray-800">
              {profileContent}
            </View>
            <View className="flex-1">
              <Placeholder
                image={Images.userProfile}
                title="My Profile"
                showBackground={false}
                imageWidth={50}
                imageHeight={80}
              />
            </View>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    width: 160,
    height: 160,
    borderRadius: 80,
  },
  cameraIconContainer: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: COLORS.CAMERA_BG,
    borderRadius: 16,
    padding: 4,
    borderWidth: 2,
    borderColor: COLORS.WHITE,
  },
});
