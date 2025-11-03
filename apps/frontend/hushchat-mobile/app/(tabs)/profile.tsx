import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, ActivityIndicator, ScrollView, Image, StyleSheet } from "react-native";
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
import { AppText, AppTextInput } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";

type ProfileFieldProps = {
  label: string;
  value?: string | null;
  editable?: boolean;
  onChangeText?: (text: string) => void;
  placeholder?: string;
};

const ProfileField = ({
  label,
  value,
  editable = false,
  onChangeText,
  placeholder,
}: ProfileFieldProps) => (
  <View className="mb-6 border-b border-gray-600 pb-2">
    <AppText className="text-sm text-gray-400 mb-1">{label}</AppText>
    {editable && onChangeText ? (
      <AppTextInput
        className="text-base dark:text-white text-black py-1"
        value={value || ""}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
      />
    ) : (
      <AppText className="text-base dark:text-white text-black">{value || "Not provided"}</AppText>
    )}
  </View>
);

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

  const { mutate: updateUser, isPending: isUpdatingUser } = useUpdateUserMutation(
    { userId: Number(user?.id) },
    (user) => {
      const imageSignedUrl = user.signedImageUrl;

      if (imageSignedUrl && imageAssetData !== null) {
        uploadImageToSignedUrl(imageAssetData?.fileUri, imageSignedUrl);
      }

      fetchUserData();
    },
    (error) => {
      ToastUtils.error(error as string);
    }
  );

  useEffect(() => {
    setFirstName(user?.firstName || "");
    setLastName(user?.lastName || "");
    setImageError(false);
  }, [user]);

  const handleLogout = async () => {
    queryClient.clear();

    await logout();

    // ⚠️ Temporary workaround: Wait for storage to finish properly before navigating
    await new Promise((resolve) => setTimeout(resolve, 300)); // 300ms delay
    router.replace(AUTH_WORKSPACE_FORM_PATH);
  };

  const handleUpdate = async () => {
    if (
      firstName.trim() === user?.firstName &&
      lastName.trim() === user?.lastName &&
      imagePickerResult === null
    )
      return;

    const imageAssetData = getImagePickerAsset(imagePickerResult, UploadType.PROFILE);
    setImageAssetData(imageAssetData);

    updateUser({
      id: user?.id ?? "",
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      imageFileName: imageAssetData ? imageAssetData.fileName : null,
    });
  };

  const uploadImageResult = async () => {
    setUploading(true);
    const pickerResult = await uploadImage();
    setImagePickerResult(pickerResult);
    setUploading(false);
  };

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-100 dark:bg-gray-900">
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  const ProfileContent = () => (
    <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
      <View className="mt-8 px-4">
        <View className="items-center py-10 rounded-3xl max-w-3xl w-full mx-auto dark:bg-background-dark light:bg-secondary-light">
          <TouchableOpacity
            onPress={uploadImageResult}
            disabled={uploading}
            activeOpacity={DEFAULT_ACTIVE_OPACITY}
          >
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
                <InitialsAvatar name={`${user.firstName ?? ""}`} size="lg" />
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
          />
          <ProfileField
            label="Last Name"
            value={lastName}
            editable
            onChangeText={setLastName}
            placeholder="Enter last name"
          />
          <ProfileField label="Email" value={user?.email} />
        </View>
      </View>

      <View className="mt-6 px-4">
        <View className="max-w-3xl w-full mx-auto">
          <TouchableOpacity
            onPress={handleUpdate}
            disabled={
              isUpdatingUser ||
              (firstName.trim() === user?.firstName &&
                lastName.trim() === user?.lastName &&
                imagePickerResult === null)
            }
            className="bg-blue-500 py-4 rounded-xl items-center mb-3"
          >
            {isUpdatingUser ? (
              <ActivityIndicator size={20} color="#ffffff" />
            ) : (
              <AppText className="text-white text-base font-semibold">Update Profile</AppText>
            )}
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleLogout}
            disabled={isUpdatingUser}
            className="bg-red-500 py-4 rounded-xl items-center"
          >
            <AppText className="text-white text-base font-semibold">Logout</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
        {isMobile ? (
          <ProfileContent />
        ) : (
          <View className="flex-1 flex-row">
            <View className="w-full max-w-[460px] border-r border-gray-200 dark:border-gray-800">
              <ProfileContent />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
});