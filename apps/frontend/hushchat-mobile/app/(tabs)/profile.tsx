import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator, ScrollView, Image } from "react-native";
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
import { AUTH_WORKSPACE_FORM_PATH } from "@/constants/routes";
import {
  getImagePickerAsset,
  uploadImage,
  uploadImageToSignedUrl,
  UploadType,
} from "@/apis/photo-upload-service/photo-upload-service";
import UploadIndicator from "@/components/UploadIndicator";
import { ImagePickerResult } from "expo-image-picker/src/ImagePicker.types";
import { useUpdateUserMutation } from "@/query/patch/queries";
import { ToastUtils } from "@/utils/toastUtils";
import {
  ProfileUpdateSchema,
  PasswordChangeSchema,
  PasswordChangeFormData,
} from "@/types/user/types";
import useValidation from "@/hooks/useValidation";
import { useChangePasswordQuery } from "@/query/post/queries";
import { passwordRules } from "@/utils/passwordRules";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { AppText, AppTextInput } from "@/components/AppText";

type ProfileFieldProps = {
  label: string;
  value?: string | null;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  rightIcon?: string;
  onRightIconPress?: () => void;
  error?: string | string[];
};

const ProfileField = ({
  label,
  value,
  editable = false,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  rightIcon,
  onRightIconPress,
  error,
}: ProfileFieldProps) => {
  const errorMessage = Array.isArray(error) ? error[0] : error;

  return (
    <View className="mb-6 border-b border-gray-600 pb-2">
      <AppText className="text-sm text-gray-400 mb-1">{label}</AppText>
      {editable && onChangeText ? (
        <View className="flex-row items-center">
          <AppTextInput
            className={`text-base dark:text-white text-black py-1 flex-1 ${errorMessage ? 'border-red-500' : ''}`}
            value={value || ""}
            onChangeText={onChangeText}
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
        <AppText className="text-base dark:text-white text-black">{value || "Not provided"}</AppText>
      )}
      {errorMessage && <AppText className="text-red-500 text-xs mt-1">{errorMessage}</AppText>}
    </View>
  );
};

export default function Profile() {
  const { logout } = useAuthStore();
  const { user, loading, fetchUserData } = useUserStore();
  const isMobile = !PLATFORM.IS_WEB;
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [uploading, setUploading] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imagePickerResult, setImagePickerResult] = useState<ImagePickerResult | null>(null);
  const [imageAssetData, setImageAssetData] = useState({
    fileUri: "",
    fileName: "",
    fileType: "",
  });
  const queryClient = useQueryClient();

  const [passwordForm, setPasswordForm] = useState<PasswordChangeFormData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  function hasPasswordData(): boolean {
    return !!(
      passwordForm.currentPassword ||
      passwordForm.newPassword ||
      passwordForm.confirmPassword
    );
  }

  const [profileErrors] = useValidation(ProfileUpdateSchema, {
    firstName,
    lastName,
  });
  const [passwordErrors] = useValidation(
    PasswordChangeSchema,
    hasPasswordData() ? passwordForm : null,
  );

  const changeUserPassword = useChangePasswordQuery(
    () => {
      ToastUtils.success("Password updated successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    },
    (error: any) => {
      ToastUtils.error(error?.message ?? "Something went wrong");
    }
  );

  const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUserMutation(
    { userId: Number(user?.id) },
    (user) => {
      const imageSignedUrl = user.signedImageUrl;

      if (imageSignedUrl && imageAssetData !== null) {
        uploadImageToSignedUrl(imageAssetData?.fileUri, imageSignedUrl);
      }

      fetchUserData();
    }
  );

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setImageError(false);
  }, [user?.id]);

  const handleLogout = async () => {
    queryClient.clear();

    await logout();

    // ⚠️ Temporary workaround: Wait for storage to finish properly before navigating
    await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms delay
    router.replace(AUTH_WORKSPACE_FORM_PATH);
  };

  const handleUpdateAll = async () => {
    let hasChanges = false;

    // Handle profile updates (name or image changes)
    const hasProfileChanges = firstName.trim() !== user?.firstName || 
                              lastName.trim() !== user?.lastName || 
                              imagePickerResult;

    if (hasProfileChanges && isProfileValid) {
      hasChanges = true;

      const imageData = imagePickerResult
        ? getImagePickerAsset(imagePickerResult, UploadType.PROFILE)
        : null;

      if (imageData) setImageAssetData(imageData);

      updateUser({
        id: user?.id ?? "",
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        imageFileName: imageData ? imageData.fileName : null,
      });
    }

    if (hasPasswordData() && isPasswordValid) {
      hasChanges = true;

      changeUserPassword.mutate({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
    }

    if (!hasChanges) {
      ToastUtils.info("No changes to update");
    }
  };

  const uploadImageResult = async () => {
    setUploading(true);
    const pickerResult = await uploadImage();
    setImagePickerResult(pickerResult ?? null);
    setUploading(false);
  };

  const updatePasswordField = (field: keyof PasswordChangeFormData) => (value: string) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const toggleNewPassword = () => setShowNewPassword(!showNewPassword);
  const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const isProfileChanged = () => {
    return firstName.trim() !== user?.firstName || lastName.trim() !== user?.lastName;
  };

  const isProfileValid = !profileErrors;
  const isPasswordValid = !passwordErrors;

  const renderPasswordRequirements = () => {
    if (!passwordForm.newPassword) return null;

    return (
      <View className="mb-6">
        <AppText className="text-xs text-gray-500 mb-2">Password Requirements:</AppText>
        <View>
          {passwordRules.map((rule, index) => {
            const passed = rule.test(passwordForm.newPassword);
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

  const profileContent = (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }} className="custom-scrollbar">
      <View className="mt-8 px-4">
        <View className="items-center py-10 rounded-3xl max-w-3xl w-full mx-auto dark:bg-background-dark light:bg-secondary-light">
          <TouchableOpacity onPress={uploadImageResult} disabled={uploading} activeOpacity={DEFAULT_ACTIVE_OPACITY}>
           <View style={{ position: "relative" }}>
              {imagePickerResult?.assets?.[0]?.uri ? (
                <Image
                  source={{ uri: imagePickerResult.assets[0].uri }}
                  style={{ width: 160, height: 160, borderRadius: 80 }}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : user.signedImageUrl && !imageError ? (
                <Image
                  source={{ uri: user.signedImageUrl }}
                  style={{ width: 160, height: 160, borderRadius: 80 }}
                  resizeMode="cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <InitialsAvatar name={`${user.firstName} ${user.lastName}`} size="lg" />
              )}

              <UploadIndicator isUploading={uploading} />

              <View
                style={{
                  position: "absolute",
                  bottom: 0,
                  right: 0,
                  backgroundColor: "#3b82f6",
                  borderRadius: 16,
                  padding: 4,
                  borderWidth: 2,
                  borderColor: "#fff",
                }}
              >
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
            value={firstName}
            editable
            onChangeText={setFirstName}
            placeholder="Enter first name"
            error={profileErrors?.firstName}
          />
          <ProfileField
            label="Last Name"
            value={lastName}
            editable
            onChangeText={setLastName}
            placeholder="Enter last name"
            error={profileErrors?.lastName}
          />
          <ProfileField label="Email" value={user?.email} />

          <View className="mt-6">
            <AppText className="text-lg dark:text-white font-semibold mb-4">Change Password</AppText>

            <ProfileField
              label="Current Password"
              value={passwordForm.currentPassword}
              editable
              secureTextEntry={!showCurrentPassword}
              onChangeText={updatePasswordField('currentPassword')}
              rightIcon={showCurrentPassword ? 'eye-off' : 'eye'}
              onRightIconPress={toggleCurrentPassword}
              error={passwordErrors?.currentPassword}
            />

            <ProfileField
              label="New Password"
              value={passwordForm.newPassword}
              editable
              secureTextEntry={!showNewPassword}
              onChangeText={updatePasswordField('newPassword')}
              rightIcon={showNewPassword ? 'eye-off' : 'eye'}
              onRightIconPress={toggleNewPassword}
              error={passwordErrors?.newPassword}
            />

            <ProfileField
              label="Confirm New Password"
              value={passwordForm.confirmPassword}
              editable
              secureTextEntry={!showConfirmPassword}
              onChangeText={updatePasswordField('confirmPassword')}
              rightIcon={showConfirmPassword ? 'eye-off' : 'eye'}
              onRightIconPress={toggleConfirmPassword}
              error={passwordErrors?.confirmPassword}
            />

            {renderPasswordRequirements()}
          </View>
        </View>
      </View>

      <View className="mt-6 px-4">
        <View className="max-w-3xl w-full mx-auto">
          <TouchableOpacity
            onPress={handleUpdateAll}
            disabled={
              isUpdatingUser ||
              changeUserPassword.isPending ||
              (!isProfileChanged() && !hasPasswordData()) ||
              !isProfileValid 
            }
            className={`py-4 rounded-xl items-center mb-3 ${(
              (isProfileChanged() && isProfileValid) || (hasPasswordData() && isPasswordValid)
            ) ? "bg-blue-500" : "bg-gray-400"}`}
          >
            {isUpdatingUser || changeUserPassword.isPending ? (
              <ActivityIndicator size={20} color="#ffffff" />
            ) : (
              <AppText className="text-white text-base font-semibold">Update</AppText>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isUpdatingUser || changeUserPassword.isPending}
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
      )}
    </SafeAreaView>
  );
}
