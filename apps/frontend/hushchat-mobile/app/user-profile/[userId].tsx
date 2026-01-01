import { View, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useGetUserProfileQuery } from "@/query/useGetUserProfileQuery";
import { useUpdateUserProfileMutation } from "@/query/patch/queries";
import UserDetails from "@/components/settings/users/UserDeails";
import UserDetailsEdit, { EditedData } from "@/components/settings/users/UserDetailsEdit";
import { ToastUtils } from "@/utils/toastUtils";
import { useState, useRef } from "react";
import MobileHeader from "@/components/MobileHeader";
import { useUserStore } from "@/store/user/useUserStore";
import { WorkspaceUserRole } from "@/app/guards/RoleGuard";
import { UpdateUserProfileInput } from "@/types/user/types";

export default function UserProfileScreen() {
  const { userId } = useLocalSearchParams<{ userId: string }>();
  const userIdNumber = userId ? parseInt(userId) : null;
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const editedDataRef = useRef<EditedData | null>(null);

  const { user: currentUser } = useUserStore();
  const isAdmin = currentUser?.workspaceRole === WorkspaceUserRole.ADMIN;
  const isCurrentUser = currentUser?.id === userIdNumber;

  const { userProfile, isLoadingUserProfile, userProfileError } =
    useGetUserProfileQuery(userIdNumber);

  const updateProfileMutation = useUpdateUserProfileMutation(
    { userId: userIdNumber! },
    () => {
      ToastUtils.success("Profile updated successfully");
      setIsEditMode(false);
      setHasChanges(false);
    },
    (error: any) => {
      ToastUtils.error(error);
    }
  );

  const canEdit = isAdmin && !isCurrentUser;

  const handleDataChange = (changed: boolean, data: EditedData) => {
    setHasChanges(changed);
    editedDataRef.current = data;
  };

  const handleSave = () => {
    if (!userIdNumber || !userProfile || !editedDataRef.current) return;

    if (!editedDataRef.current.firstName.trim() || !editedDataRef.current.lastName.trim()) {
      ToastUtils.error("First name and last name are required");
      return;
    }

    const completeData: UpdateUserProfileInput = {
      firstName: editedDataRef.current.firstName,
      lastName: editedDataRef.current.lastName,
      username: userProfile.username,
      email: userProfile.email,
      contactNumber: editedDataRef.current.contactNumber,
      address: editedDataRef.current.address,
      designation: editedDataRef.current.designation,
    };

    updateProfileMutation.mutate({ userId: userIdNumber, ...completeData });
  };

  const handleGoBack = () => {
    if (isEditMode) {
      if (hasChanges) {
        setIsEditMode(false);
        setHasChanges(false);
      } else {
        setIsEditMode(false);
      }
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/");
      }
    }
  };

  const handleEditPress = () => {
    setIsEditMode(true);
  };

  return (
    <View className="flex-1 bg-gray-50 dark:bg-gray-900">
      <MobileHeader
        title={isEditMode ? "Edit Profile" : "Profile"}
        onBack={handleGoBack}
        rightAction={
          isEditMode
            ? {
                label: updateProfileMutation.isPending ? "Saving..." : "Save",
                onPress: handleSave,
                disabled: !hasChanges || updateProfileMutation.isPending,
              }
            : canEdit
              ? {
                  label: "Edit",
                  onPress: handleEditPress,
                  disabled: false,
                }
              : undefined
        }
      />

      {isLoadingUserProfile ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
          <AppText className="text-gray-500 dark:text-gray-400 mt-4">
            Loading user details...
          </AppText>
        </View>
      ) : userProfileError || !userProfile ? (
        <View className="flex-1 items-center justify-center px-6">
          <Ionicons name="alert-circle-outline" size={64} color="#EF4444" />
          <AppText className="text-red-500 mt-4 text-center">Failed to load user details</AppText>
          <TouchableOpacity
            onPress={handleGoBack}
            className="mt-6 px-6 py-3 bg-primary-light dark:bg-primary-dark rounded-lg"
          >
            <AppText className="text-white font-semibold">Go Back</AppText>
          </TouchableOpacity>
        </View>
      ) : isEditMode ? (
        <UserDetailsEdit user={userProfile} onDataChange={handleDataChange} />
      ) : (
        <UserDetails user={userProfile} showCloseButton={false} />
      )}
    </View>
  );
}
