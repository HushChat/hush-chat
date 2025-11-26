import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import InitialsAvatar from "@/components/InitialsAvatar";

// Defining the interface here for reusability across different modal types
export interface IProfileDisplayData {
  name: string;
  signedImageUrl: string | null;
  isGroup?: boolean;
  secondaryText?: string; // For Email, Username, or Group description
}

interface ProfilePictureModalContentProps {
  profileData: IProfileDisplayData;
}

const ProfilePictureModalContent: React.FC<ProfilePictureModalContentProps> = ({ profileData }) => {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === "dark" ? "#D1D5DB" : "#6B7280";

  return (
    <View className="items-center py-4">
      {/* Simple Avatar */}
      {profileData.signedImageUrl ? (
        <View className="w-32 h-32 rounded-full overflow-hidden mb-6">
          <Image
            source={{ uri: profileData.signedImageUrl }}
            className="w-full h-full"
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>
      ) : (
        <View className="mb-6">
          <InitialsAvatar imageUrl={profileData.signedImageUrl} size="lg" name={profileData.name} />
        </View>
      )}

      {/* Simple Text Info */}
      <View className="items-center">
        <Text className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark mb-1">
          {profileData.name}
        </Text>

        {profileData.secondaryText && (
          <Text className="text-gray-500 dark:text-gray-400 text-base mb-2">
            {profileData.secondaryText}
          </Text>
        )}

        {profileData.isGroup && (
          <View className="flex-row items-center gap-1 mt-1">
            <Ionicons name="people" size={16} color={iconColor} />
            <Text className="text-gray-500 dark:text-gray-400 text-sm">Group Chat</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProfilePictureModalContent;
