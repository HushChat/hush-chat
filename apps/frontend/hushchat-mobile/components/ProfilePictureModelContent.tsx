import React from "react";
import { View, Text, useColorScheme, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons, Feather } from "@expo/vector-icons";
import InitialsAvatar from "@/components/InitialsAvatar";

export interface IProfileDisplayData {
  name: string;
  signedImageUrl: string | null;
  isGroup?: boolean;
  secondaryText?: string;
}

interface ProfilePictureModalContentProps {
  profileData: IProfileDisplayData;
  onMessagePress?: () => void;
  onCallPress?: () => void;
}

const ProfilePictureModalContent: React.FC<ProfilePictureModalContentProps> = ({
  profileData,
  onMessagePress,
  onCallPress,
}) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const iconColor = isDark ? "#D1D5DB" : "#6B7280";

  const buttonBg = isDark ? "#374151" : "#E5E7EB";
  const buttonText = isDark ? "#F9FAFB" : "#374151";

  return (
    <View className="items-center py-4 w-full">
      {profileData.signedImageUrl ? (
        <View className="w-28 h-28 rounded-full overflow-hidden mb-6 shadow-sm">
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

      <View className="items-center mb-6 px-4">
        <Text
          className="text-xl font-bold text-center text-text-primary-light dark:text-text-primary-dark mb-1"
          numberOfLines={1}
        >
          {profileData.name}
        </Text>

        {profileData.secondaryText && (
          <Text
            className="text-gray-500 dark:text-gray-400 text-base text-center mb-2"
            numberOfLines={1}
          >
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

      {onMessagePress && (
        <View className="flex-row items-center w-full justify-center gap-2 px-4">
          <Pressable
            onPress={onMessagePress}
            className="flex-1 flex-row items-center justify-center py-3 px-4 rounded-full"
            style={{ backgroundColor: buttonBg }}
          >
            <Feather
              name="message-circle"
              size={18}
              color={buttonText}
              style={{ marginRight: 8 }}
            />
            <Text className="font-semibold text-sm" style={{ color: buttonText }}>
              Message
            </Text>
          </Pressable>

          <Pressable
            onPress={onCallPress}
            disabled={!onCallPress}
            className="w-12 h-12 items-center justify-center rounded-full"
            style={{ backgroundColor: buttonBg, opacity: onCallPress ? 1 : 0.5 }}
          >
            <Ionicons name="call-outline" size={20} color={buttonText} />
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default ProfilePictureModalContent;
