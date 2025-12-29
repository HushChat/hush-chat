import { AppText } from "@/components/AppText";
import { View, ScrollView, TextInput } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useState, useEffect } from "react";
import { IWorkspaceUser } from "@/types/workspace-user/types";
import { IUserProfile } from "@/types/user/types";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";

interface UserDetailsEditProps {
  user: IWorkspaceUser | IUserProfile;
  onDataChange?: (hasChanges: boolean, data: EditedData) => void;
}

export interface EditedData {
  firstName: string;
  lastName: string;
  contactNumber: string;
  address: string;
  designation: string;
}

interface EditableFieldProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: "default" | "phone-pad" | "email-address";
}

const EditableField = ({
  icon,
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  keyboardType = "default",
}: EditableFieldProps) => (
  <View className="py-3">
    <View className="flex-row items-center gap-3 mb-2">
      <Ionicons name={icon} size={20} color="#9CA3AF" />
      <AppText className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</AppText>
    </View>
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      numberOfLines={multiline ? 3 : 1}
      keyboardType={keyboardType}
      className="text-sm text-gray-900 dark:text-white font-medium bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700"
      placeholderTextColor="#9CA3AF"
      style={multiline ? { minHeight: 80, textAlignVertical: "top" } : undefined}
    />
  </View>
);

const ReadOnlyField = ({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) => (
  <View className="py-3">
    <View className="flex-row items-center gap-3 mb-2">
      <Ionicons name={icon} size={20} color="#9CA3AF" />
      <AppText className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</AppText>
    </View>
    <View className="bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-700">
      <AppText className="text-sm text-gray-600 dark:text-gray-400 font-medium">{value}</AppText>
    </View>
  </View>
);

export default function UserDetailsEdit({ user, onDataChange }: UserDetailsEditProps) {
  const [editedData, setEditedData] = useState<EditedData>({
    firstName: user.firstName,
    lastName: user.lastName,
    contactNumber: user.contactNumber || "",
    address: user.address || "",
    designation: user.designation || "",
  });

  const [imageError, setImageError] = useState(false);

  const fullName = `${user.firstName} ${user.lastName}`;

  const hasChanges =
    editedData.firstName !== user.firstName ||
    editedData.lastName !== user.lastName ||
    editedData.contactNumber !== (user.contactNumber || "") ||
    editedData.address !== (user.address || "") ||
    editedData.designation !== (user.designation || "");

  useEffect(() => {
    if (onDataChange) {
      onDataChange(hasChanges, editedData);
    }
  }, [editedData, hasChanges]);

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-white dark:bg-background-dark p-6 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center gap-4">
          <InitialsAvatar
            name={fullName}
            size={AvatarSize.large}
            imageUrl={user.signedImageUrl}
            imageError={imageError}
            onImageError={() => setImageError(true)}
            userStatus={user.chatUserStatus}
            showOnlineStatus={false}
          />

          <View className="flex-1">
            <AppText className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Edit Profile
            </AppText>
            <AppText className="text-sm text-gray-600 dark:text-gray-400">
              Update user information
            </AppText>
          </View>
        </View>
      </View>

      <View className="bg-white dark:bg-background-dark mt-4 mx-4 rounded-lg p-4">
        <AppText className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
          Personal Information
        </AppText>

        <EditableField
          icon="person-outline"
          label="First Name"
          value={editedData.firstName}
          onChangeText={(text) => setEditedData({ ...editedData, firstName: text })}
          placeholder="Enter first name"
        />

        <EditableField
          icon="person-outline"
          label="Last Name"
          value={editedData.lastName}
          onChangeText={(text) => setEditedData({ ...editedData, lastName: text })}
          placeholder="Enter last name"
        />

        <ReadOnlyField icon="at" label="Username" value={user.username} />

        <ReadOnlyField icon="mail-outline" label="Email" value={user.email} />
      </View>

      <View className="bg-white dark:bg-background-dark mt-4 mx-4 rounded-lg p-4">
        <AppText className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
          Contact Information
        </AppText>

        <EditableField
          icon="call-outline"
          label="Contact Number"
          value={editedData.contactNumber}
          onChangeText={(text) => setEditedData({ ...editedData, contactNumber: text })}
          placeholder="Enter contact number"
          keyboardType="phone-pad"
        />

        <EditableField
          icon="location-outline"
          label="Address"
          value={editedData.address}
          onChangeText={(text) => setEditedData({ ...editedData, address: text })}
          placeholder="Enter address"
          multiline
        />
      </View>

      <View className="bg-white dark:bg-background-dark mt-4 mx-4 mb-6 rounded-lg p-4">
        <AppText className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
          Work Information
        </AppText>

        <EditableField
          icon="briefcase-outline"
          label="Designation"
          value={editedData.designation}
          onChangeText={(text) => setEditedData({ ...editedData, designation: text })}
          placeholder="Enter designation"
        />
      </View>
    </ScrollView>
  );
}
