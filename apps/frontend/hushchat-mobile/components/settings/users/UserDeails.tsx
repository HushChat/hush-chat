import { AppText } from "@/components/AppText";
import { View, TouchableOpacity, ScrollView, Linking } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { capitalizeFirstLetter } from "@/utils/commonUtils";
import { ToastUtils } from "@/utils/toastUtils";
import * as Clipboard from "expo-clipboard";
import { useState } from "react";
import { useUserStore } from "@/store/user/useUserStore";
import { IWorkspaceUser } from "@/types/workspace-user/types";
import { IUserProfile } from "@/types/user/types";
import { DEFAULT_STATUS_COLORS, STATUS_COLORS } from "./Users";
import InitialsAvatar, { AvatarSize } from "@/components/InitialsAvatar";

interface UserDetailsProps {
  user: IWorkspaceUser | IUserProfile;
  onMessagePress?: (user: IWorkspaceUser | IUserProfile) => void;
  showCloseButton?: boolean;
  onClose?: () => void;
}

interface DetailRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  children: React.ReactNode;
  centerVertically?: boolean;
}

const DetailRow = ({ icon, label, children, centerVertically = true }: DetailRowProps) => (
  <View className={`flex-row ${centerVertically ? "items-center" : "items-start"} py-3`}>
    <View className="w-32 flex-row items-center gap-3">
      <Ionicons name={icon} size={20} color="#9CA3AF" />
      <AppText className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</AppText>
    </View>
    <View className="flex-1">{children}</View>
  </View>
);

const isWorkspaceUser = (user: IWorkspaceUser | IUserProfile): user is IWorkspaceUser => {
  return "status" in user;
};

export default function UserDetails({
  user,
  onMessagePress,
  showCloseButton = false,
  onClose,
}: UserDetailsProps) {
  const { user: currentUser } = useUserStore();
  const currentUserEmail = currentUser?.email;

  const [imageError, setImageError] = useState(false);

  const fullName = `${user.firstName} ${user.lastName}`;
  const isCurrentUser = currentUserEmail === user.email;

  const statusColors = isWorkspaceUser(user)
    ? STATUS_COLORS[user.status as keyof typeof STATUS_COLORS] || DEFAULT_STATUS_COLORS
    : null;

  const handleCopyEmail = async () => {
    await Clipboard.setStringAsync(user.email);
    ToastUtils.success("Email copied to clipboard");
  };

  const handleOpenMail = () => {
    Linking.openURL(`mailto:${user.email}`);
  };

  const handleMessageClick = () => {
    if (onMessagePress) {
      onMessagePress(user);
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      {showCloseButton && (
        <View className="flex-row items-center justify-between p-4 bg-white dark:bg-background-dark border-b border-gray-200 dark:border-gray-800">
          <AppText className="text-lg font-semibold text-gray-900 dark:text-white">Profile</AppText>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      )}

      <View className="bg-white dark:bg-background-dark p-6 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-4">
            <InitialsAvatar
              name={fullName}
              size={AvatarSize.large}
              imageUrl={user.signedImageUrl}
              imageError={imageError}
              onImageError={handleImageError}
              userStatus={user.chatUserStatus}
              showOnlineStatus={false}
            />

            <View>
              <AppText className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {fullName}
              </AppText>
              <AppText className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {user.email}
              </AppText>
              <View className="pt-2">
                <AppText className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  {user.chatUserStatus}
                </AppText>
              </View>
            </View>
          </View>

          <View className="flex-row gap-2">
            {!isCurrentUser && onMessagePress && (
              <TouchableOpacity
                onPress={handleMessageClick}
                className="w-12 h-12 items-center justify-center bg-primary-light dark:bg-primary-dark rounded-full"
              >
                <Ionicons name="chatbubble" size={20} color="white" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <View className="bg-white dark:bg-background-dark mt-4 mx-4 rounded-lg p-4">
        <DetailRow icon="person-outline" label="Full Name">
          <AppText className="text-sm text-gray-900 dark:text-white font-medium">
            {fullName}
          </AppText>
        </DetailRow>

        <DetailRow icon="at" label="Username">
          <AppText className="text-sm text-gray-900 dark:text-white font-medium">
            {user.username}
          </AppText>
        </DetailRow>

        <DetailRow icon="mail-outline" label="Email">
          <View className="flex-row items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-lg pl-3">
            <AppText
              className="text-sm text-gray-900 dark:text-white font-medium flex-1 mr-2"
              numberOfLines={1}
            >
              {user.email}
            </AppText>

            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={handleOpenMail}
                className="w-8 h-8 items-center justify-center bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 shadow-sm"
              >
                <Ionicons name="at" size={16} color="#4B5563" />
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleCopyEmail}
                className="w-8 h-8 items-center justify-center bg-white dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600 shadow-sm"
              >
                <Ionicons name="copy-outline" size={16} color="#4B5563" />
              </TouchableOpacity>
            </View>
          </View>
        </DetailRow>

        {user.contactNumber && (
          <DetailRow icon="call-outline" label="Contact">
            <AppText className="text-sm text-gray-900 dark:text-white font-medium">
              {user.contactNumber}
            </AppText>
          </DetailRow>
        )}

        {user.address && (
          <DetailRow icon="location-outline" label="Address" centerVertically={false}>
            <AppText className="text-sm text-gray-900 dark:text-white font-medium">
              {user.address}
            </AppText>
          </DetailRow>
        )}

        {user.designation && (
          <DetailRow icon="briefcase-outline" label="Designation">
            <AppText className="text-sm text-gray-900 dark:text-white font-medium">
              {user.designation}
            </AppText>
          </DetailRow>
        )}

        {isWorkspaceUser(user) && statusColors && (
          <DetailRow icon="shield-checkmark-outline" label="Status">
            <View className={`flex-row px-3 py-1 rounded-full ${statusColors.bg} self-start`}>
              <AppText className={`text-xs font-medium ${statusColors.text}`}>
                {capitalizeFirstLetter(user.status)}
              </AppText>
            </View>
          </DetailRow>
        )}
      </View>
    </ScrollView>
  );
}
