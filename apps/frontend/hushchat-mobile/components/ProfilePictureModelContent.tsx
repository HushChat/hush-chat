import React from "react";
import { View, Text, useColorScheme } from "react-native";
import { Image } from "expo-image";

import { Ionicons } from "@expo/vector-icons";
import InitialsAvatar from "@/components/InitialsAvatar";
import { IConversation } from "@/types/chat/types";

interface ProfilePictureModalContentProps {
  conversation: IConversation;
}

const ProfilePictureModalContent: React.FC<ProfilePictureModalContentProps> = ({
  conversation,
}) => {
  const colorScheme = useColorScheme(); // 'light' or 'dark'
  const iconColor = colorScheme === "dark" ? "#D1D5DB" : "#6B7280";
  return (
    <View className="items-center py-4">
      {conversation.signedImageUrl ? (
        <View className="w-32 h-32 rounded-full overflow-hidden mb-6">
          <Image
            source={{ uri: conversation.signedImageUrl }}
            className="w-full h-full"
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        </View>
      ) : (
        <View className="mb-6">
          <InitialsAvatar
            imageUrl={conversation.signedImageUrl}
            size="lg"
            name={conversation.name}
          />
        </View>
      )}

      <View className="items-center">
        {conversation.isGroup && (
          <View className="flex-row items-center gap-1 mb-3">
            <Ionicons name="people" size={16} color={iconColor} />
            <Text className="text-gray-500 dark:text-gray-400 text-sm">
              Group Chat
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default ProfilePictureModalContent;
