import { AppText } from "@/components/AppText";
import { View, TouchableOpacity, ScrollView, Linking } from "react-native";
import { IWorkspaceUser } from "@/types/workspace-user/types";
import { Ionicons } from "@expo/vector-icons";
import { capitalizeFirstLetter } from "@/utils/commonUtils";
import { DEFAULT_STATUS_COLORS, STATUS_COLORS } from "./Users";
import { ToastUtils } from "@/utils/toastUtils";
import * as Clipboard from "expo-clipboard";
import { Image } from "expo-image";
import { useState } from "react";
import { useUserStore } from "@/store/user/useUserStore";

interface UserDetailsProps {
  user: IWorkspaceUser;
  onMessagePress: (user: IWorkspaceUser) => void;
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

const getInitials = (name: string): string => {
  const names = name.trim().split(" ");
  if (names.length >= 2) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

export default function UserDetails({ user, onMessagePress }: UserDetailsProps) {
  const { user: currentUser } = useUserStore();
  const currentUserEmail = currentUser.email;
  const fullName = `${user.firstName} ${user.lastName}`;
  const statusColors =
    STATUS_COLORS[user.status as keyof typeof STATUS_COLORS] || DEFAULT_STATUS_COLORS;

  const [imageError, setImageError] = useState(false);
  const shouldShowImage = user.imageIndexedName && !imageError;
  const isCurrentUser = currentUserEmail === user.email;

  const handleCopyEmail = async () => {
    await Clipboard.setStringAsync(user.email);
    ToastUtils.success("Email copied to clipboard");
  };

  const handleOpenMail = () => {
    Linking.openURL(`mailto:${user.email}`);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <ScrollView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <View className="bg-white dark:bg-background-dark p-6 border-b border-gray-200 dark:border-gray-800">
        <View className="flex-row items-center justify-between mb-4">
          <View className="flex-row items-center gap-4">
            <View className="relative">
              <View className="w-32 h-32 rounded-lg bg-primary-light dark:bg-primary-dark items-center justify-center overflow-hidden">
                {shouldShowImage ? (
                  <Image
                    source={{ uri: user.imageIndexedName }}
                    style={{ width: 100, height: 100 }}
                    contentFit="cover"
                    cachePolicy="memory-disk"
                    onError={handleImageError}
                  />
                ) : (
                  <AppText className="font-semibold text-center text-white text-2xl">
                    {getInitials(fullName)}
                  </AppText>
                )}
              </View>
            </View>

            <View>
              <AppText className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {fullName}
              </AppText>
              <AppText className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                {user.email}
              </AppText>
              <View className={`pt-10`}>
                <AppText className={`text-xs font-medium`}>{user.chatUserStatus}</AppText>
              </View>
            </View>
          </View>

          {!isCurrentUser && (
            <TouchableOpacity
              onPress={() => onMessagePress(user)}
              className="w-12 h-12 items-center justify-center bg-primary-light dark:bg-primary-dark rounded-full"
            >
              <Ionicons name="chatbubble" size={20} color="white" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View className="bg-white dark:bg-background-dark mt-4 mx-4 rounded-lg p-4">
        <DetailRow icon="person-outline" label="First Name">
          <View className="flex-row">
            <AppText className="text-sm text-gray-900 dark:text-white font-medium">
              {fullName}
            </AppText>
          </View>
        </DetailRow>

        <DetailRow icon="at" label="Username">
          <View className="flex-row">
            <AppText className="text-sm text-gray-900 dark:text-white font-medium">
              {user.username}
            </AppText>
          </View>
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

        <DetailRow icon="shield-checkmark-outline" label="Status">
          <View className={`flex-row px-3 py-1 rounded-full ${statusColors.bg} self-start`}>
            <AppText className={`text-xs font-medium ${statusColors.text}`}>
              {capitalizeFirstLetter(user.status)}
            </AppText>
          </View>
        </DetailRow>
      </View>
    </ScrollView>
  );
}
