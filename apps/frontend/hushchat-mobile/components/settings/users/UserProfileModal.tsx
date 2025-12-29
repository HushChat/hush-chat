import { View, TouchableOpacity, ActivityIndicator, Modal, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { useGetUserProfileQuery } from "@/query/useGetUserProfileQuery";
import { useUpdateUserProfileMutation } from "@/query/patch/queries";
import UserDetails from "./UserDeails";
import { useUserStore } from "@/store/user/useUserStore";
import { WorkspaceUserRole } from "@/app/guards/RoleGuard";
import { useState, useRef } from "react";
import UserDetailsEdit, { EditedData } from "./UserDetailsEdit";
import { ToastUtils } from "@/utils/toastUtils";
import { UpdateUserProfileInput } from "@/types/user/types";

interface UserDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  userId: number | null;
}

export default function UserDetailsModal({ visible, onClose, userId }: UserDetailsModalProps) {
  const { user: currentUser } = useUserStore();
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const editedDataRef = useRef<EditedData | null>(null);

  const { userProfile, isLoadingUserProfile, userProfileError } = useGetUserProfileQuery(userId);

  const isAdmin = currentUser?.workspaceRole === WorkspaceUserRole.ADMIN;
  const isCurrentUser = currentUser?.id === userId;
  const canEdit = isAdmin && !isCurrentUser;

  const updateProfileMutation = useUpdateUserProfileMutation(
    { userId: userId! },
    () => {
      ToastUtils.success("Profile updated successfully");
      setIsEditMode(false);
      setHasChanges(false);
    },
    (error: any) => {
      ToastUtils.error(error);
    }
  );

  const handleDataChange = (changed: boolean, data: EditedData) => {
    setHasChanges(changed);
    editedDataRef.current = data;
  };

  const handleSave = () => {
    if (!userId || !userProfile || !editedDataRef.current) return;

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

    updateProfileMutation.mutate({ userId, ...completeData });
  };

  const handleEditPress = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setHasChanges(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 flex-row">
        <Pressable
          onPress={onClose}
          className="flex-1"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        />

        <View
          className="bg-white dark:bg-background-dark"
          style={{
            width: 550,
            maxWidth: "90%",
            shadowColor: "#000",
            shadowOffset: { width: -4, height: 0 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <View className="flex-row items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
            <View className="flex-row items-center gap-3 flex-1">
              {isEditMode && (
                <TouchableOpacity onPress={handleCancel}>
                  <Ionicons name="arrow-back" size={24} color="#6B7280" />
                </TouchableOpacity>
              )}
              <AppText className="text-lg font-semibold text-gray-900 dark:text-white">
                {isEditMode ? "Edit Profile" : "Profile"}
              </AppText>
            </View>

            <View className="flex-row items-center gap-2">
              {isEditMode ? (
                <TouchableOpacity
                  onPress={handleSave}
                  disabled={!hasChanges || updateProfileMutation.isPending}
                  className={`px-4 py-2 rounded-lg ${
                    !hasChanges || updateProfileMutation.isPending
                      ? "bg-gray-300 dark:bg-gray-600"
                      : "bg-blue-500 dark:bg-blue-600"
                  }`}
                >
                  <AppText
                    className={`font-semibold ${
                      !hasChanges || updateProfileMutation.isPending
                        ? "text-gray-500 dark:text-gray-400"
                        : "text-white"
                    }`}
                  >
                    {updateProfileMutation.isPending ? "Saving..." : "Save"}
                  </AppText>
                </TouchableOpacity>
              ) : (
                canEdit && (
                  <TouchableOpacity onPress={handleEditPress} className="p-2">
                    <Ionicons name="create-outline" size={24} color="#6B7280" />
                  </TouchableOpacity>
                )
              )}
              <TouchableOpacity onPress={onClose} className="p-2">
                <Ionicons name="close" size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

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
              <AppText className="text-red-500 mt-4 text-center">
                Failed to load user details
              </AppText>
              <TouchableOpacity
                onPress={onClose}
                className="mt-4 px-6 py-2 bg-primary-light dark:bg-primary-dark rounded-lg"
              >
                <AppText className="text-white font-semibold">Close</AppText>
              </TouchableOpacity>
            </View>
          ) : isEditMode ? (
            <UserDetailsEdit user={userProfile} onDataChange={handleDataChange} />
          ) : (
            <UserDetails user={userProfile} showCloseButton={false} />
          )}
        </View>
      </View>
    </Modal>
  );
}
