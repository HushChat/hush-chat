import React, { useEffect, useRef } from "react";
import { View, ScrollView } from "react-native";
import InitialsAvatar from "@/components/InitialsAvatar";
import { AppText } from "@/components/AppText";
import { ProfileField } from "./ProfileField";
import { PasswordSection } from "./PasswordSection";
import { ProfileActions } from "./ProfileActions";
import { useUserStore } from "@/store/user/useUserStore";
import { usePasswordVisibility } from "@/hooks/usePasswordVisibility";
import { useLogout } from "@/hooks/useLogout";
import { useProfileForm } from "@/hooks/useProfileForm";
import LoadingState from "@/components/LoadingState";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";
import DragAndDropOverlay from "@/components/conversations/conversation-thread/message-list/file-upload/DragAndDropOverlay";
import { Ionicons } from "@expo/vector-icons";
import AvailabilitySection from "@/components/profile/components/AvailabilitySection";
import { chatUserStatus } from "@/types/chat/types";

const SCROLL_CONTENT_PADDING_BOTTOM = 40;

export const ProfileForm = () => {
  const { user, loading } = useUserStore();

  const passwordVisibility = usePasswordVisibility();
  const { handleLogout } = useLogout();

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
    handleDroppedFiles,
  } = useProfileForm();

  const avatarDropRef = useRef<View>(null);

  const { isDragging } = useDragAndDrop(avatarDropRef, {
    onDropFiles: (files) => {
      handleDroppedFiles(files);
    },
  });

  useEffect(() => {
    syncUserData();
  }, [user?.id, syncUserData]);

  if (loading) {
    return <LoadingState />;
  }

  const isUpdateButtonDisabled = isLoading || (!isProfileChanged && !hasPasswordData);

  const avatarProps = {
    imageUri: imagePickerResult?.assets?.[0]?.uri,
    uploading,
    imageError,
    onPress: uploadImageResult,
    onImageError: () => setImageError(true),
  };

  const actionProps = {
    onUpdate: submit,
    onLogout: handleLogout,
    isUpdateDisabled: isUpdateButtonDisabled,
    isLoading,
  };

  const userName = `${user.firstName} ${user.lastName}`;

  const avatarUrl = !avatarProps.imageError ? (avatarProps.imageUri ?? user.signedImageUrl) : null;

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: SCROLL_CONTENT_PADDING_BOTTOM }}
      className="custom-scrollbar dark:bg-background-dark bg-background-light"
    >
      <View className="px-4 py-5">
        <View className="max-w-3xl w-full mx-auto">
          <AppText className="text-2xl font-bold text-text-primary-light dark:text-text-primary-dark">
            My Profile
          </AppText>
          <AppText className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your personal information and preferences
          </AppText>
        </View>
      </View>

      <View className="px-4 items-center">
        <View className="bg-white dark:bg-gray-800/50 rounded-xl p-5 items-center max-w-3xl w-full mx-auto">
          <View className="relative">
            <View ref={avatarDropRef} className="relative rounded-full overflow-hidden">
              <DragAndDropOverlay visible={isDragging} variant="avatar" />
              <InitialsAvatar
                name={userName}
                size="lg"
                imageUrl={avatarUrl}
                imageError={avatarProps.imageError}
                onImageError={avatarProps.onImageError}
                isUploading={avatarProps.uploading}
                showCameraIcon={false}
                onPress={avatarProps.onPress}
              />
            </View>
            <View className="absolute bottom-0 right-0 bg-primary-light dark:bg-primary-dark rounded-full p-1.5 border-[3px] border-background-light dark:border-background-dark pointer-events-none">
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </View>
          <AppText className="text-lg font-semibold text-text-primary-light dark:text-text-primary-dark mt-3">
            {userName}
          </AppText>
          <AppText className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {user.email}
          </AppText>
        </View>
      </View>

      <View className="mt-5 px-4">
        <View className="max-w-3xl w-full mx-auto">
          <View className="bg-white dark:bg-gray-800/50 rounded-xl p-5 mb-5">
            <AppText className="text-base font-semibold text-text-primary-light dark:text-text-primary-dark mb-4">
              Personal Information
            </AppText>

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
          </View>

          <AvailabilitySection status={user.status ?? chatUserStatus.OFFLINE} />

          <PasswordSection
            formValues={formValues}
            formErrors={formErrors}
            showErrors={showErrors}
            onValueChange={onValueChange}
            passwordVisibility={passwordVisibility}
          />
        </View>
      </View>

      <ProfileActions {...actionProps} />
    </ScrollView>
  );
};
