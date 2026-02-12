import React, { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, TouchableOpacity, View } from "react-native";
import { AppText } from "@/components/AppText";
import BackButton from "@/components/BackButton";
import InitialsAvatar from "@/components/InitialsAvatar";
import { ProfileField } from "@/components/profile/components/ProfileField";
import { useWorkspaceChatUserByIdQuery } from "@/query/useWorkspaceChatUserByIdQuery";
import { useToggleUserRoleMutation, useUpdateUserMutation } from "@/query/patch/queries";
import { useUserStore } from "@/store/user/useUserStore";
import { WorkspaceUserRole } from "@/app/guards/RoleGuard";
import { ToastUtils } from "@/utils/toastUtils";

interface UserEditFormProps {
  userId: number;
  onBack: () => void;
}

export default function UserEditForm({ userId, onBack }: UserEditFormProps) {
  const { user: currentUser } = useUserStore();
  const { user, isLoading } = useWorkspaceChatUserByIdQuery(userId);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
    }
  }, [user]);

  const isSelf = user?.email === currentUser.email;
  const hasNameChanges =
    user !== null && (firstName !== user.firstName || lastName !== user.lastName);

  const { mutate: toggleRole, isPending: isToggling } = useToggleUserRoleMutation(
    { userId },
    () => {
      ToastUtils.success("Role updated successfully");
    },
    () => {
      ToastUtils.error("Failed to update role");
    }
  );

  const { mutate: updateUser, isPending: isSaving } = useUpdateUserMutation(
    { userId },
    () => {
      ToastUtils.success("User updated successfully");
    },
    () => {
      ToastUtils.error("Failed to update user");
    }
  );

  const handleToggleRole = () => {
    if (!user || isSelf) return;
    toggleRole({ email: user.email });
  };

  const handleSave = () => {
    if (!user || !hasNameChanges) return;
    updateUser({
      id: String(user.id),
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      imageFileName: user.imageIndexedName ?? null,
    });
  };

  const handleFieldChange = ({ name, value }: { name: string; value: string }) => {
    if (name === "firstName") setFirstName(value);
    if (name === "lastName") setLastName(value);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center">
        <AppText className="text-gray-500 dark:text-gray-400 text-base">User not found.</AppText>
      </View>
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const isAdmin = user.workspaceRole === WorkspaceUserRole.ADMIN;

  return (
    <View className="flex-1">
      <View className="flex-row items-center mb-6 mt-3 px-4">
        <BackButton onPress={onBack} />
        <AppText className="text-2xl font-bold text-gray-900 dark:text-white ml-2">
          Edit User
        </AppText>
      </View>

      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="items-center mb-6">
          <InitialsAvatar
            name={fullName || "Unknown User"}
            imageUrl={user.signedImageUrl}
            size="lg"
          />
          <AppText className="text-lg font-semibold text-gray-900 dark:text-white mt-3">
            {fullName || "Unknown User"}
          </AppText>
        </View>

        <ProfileField
          label="First Name"
          name="firstName"
          value={firstName}
          editable
          onValueChange={handleFieldChange}
        />
        <ProfileField
          label="Last Name"
          name="lastName"
          value={lastName}
          editable
          onValueChange={handleFieldChange}
        />
        <ProfileField label="Email" value={user.email} />
        <ProfileField label="Username" value={user.username} />

        {hasNameChanges && (
          <TouchableOpacity
            onPress={handleSave}
            disabled={isSaving}
            className="bg-blue-500 rounded-lg py-3 mb-4 items-center"
          >
            {isSaving ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <AppText className="text-white text-base font-medium">Save Changes</AppText>
            )}
          </TouchableOpacity>
        )}

        <View className="mt-2 mb-4">
          <AppText className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark mb-2">
            Role
          </AppText>
          <View className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3">
            <View
              className={`px-3 py-1 rounded-full ${isAdmin ? "bg-blue-100 dark:bg-blue-900/40" : "bg-gray-200 dark:bg-gray-700"}`}
            >
              <AppText
                className={`text-sm font-medium ${isAdmin ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400"}`}
              >
                {user.workspaceRole}
              </AppText>
            </View>

            <TouchableOpacity
              onPress={handleToggleRole}
              disabled={isSelf || isToggling}
              className={`px-4 py-2 rounded-lg ${
                isSelf || isToggling
                  ? "bg-gray-300 dark:bg-gray-700"
                  : isAdmin
                    ? "bg-red-500"
                    : "bg-blue-500"
              }`}
            >
              {isToggling ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <AppText className="text-white text-sm font-medium">
                  {isAdmin ? "Remove Admin" : "Make Admin"}
                </AppText>
              )}
            </TouchableOpacity>
          </View>
          {isSelf && (
            <AppText className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              You cannot change your own role.
            </AppText>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
