import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useUserStore } from "@/store/user/useUserStore";
import { useProfileForm } from "@/hooks/useProfileForm";
import { PLATFORM } from "@/constants/platformConstants";
import { LoadingScreen, ProfileContent } from "@/components/profile/ProfileContent";
import { DesktopLayout } from "@/components/profile/DesktopLayout";
import { usePasswordVisibility } from "@/hooks/usePasswordVisibility";
import { useLogout } from "@/hooks/useLogout";

export default function ProfileC() {
  const { user, loading } = useUserStore();
  const isMobile = !PLATFORM.IS_WEB;

  // Custom hooks
  const passwordVisibility = usePasswordVisibility();
  const { handleLogout } = useLogout();

  // Profile form state and handlers
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

  // Loading state
  if (loading) {
    return <LoadingScreen />;
  }

  // Derived state
  const isUpdateButtonDisabled = isLoading || (!isProfileChanged && !hasPasswordData);

  // Props for child components
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

  // Main content
  const profileContent = (
    <ProfileContent
      user={user}
      formValues={formValues}
      formErrors={formErrors}
      showErrors={showErrors}
      onValueChange={onValueChange}
      passwordVisibility={passwordVisibility}
      avatarProps={avatarProps}
      actionProps={actionProps}
    />
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light dark:bg-background-dark">
      {isMobile ? profileContent : <DesktopLayout>{profileContent}</DesktopLayout>}
    </SafeAreaView>
  );
}
