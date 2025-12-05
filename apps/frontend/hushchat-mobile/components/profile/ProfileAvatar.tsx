import React from "react";
import { View, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import InitialsAvatar from "@/components/InitialsAvatar";
import UploadIndicator from "@/components/UploadIndicator";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { profileStyles } from "@/components/profile/profile.styles";
import { PROFILE_COLORS, PROFILE_SIZES } from "@/components/profile/profile.constants";

interface IProfileAvatarProps {
  imageUri?: string | null;
  signedImageUrl?: string | null;
  userName: string;
  uploading: boolean;
  imageError: boolean;
  onPress: () => void;
  onImageError: () => void;
}

export function ProfileAvatar({
  imageUri,
  signedImageUrl,
  userName,
  uploading,
  imageError,
  onPress,
  onImageError,
}: IProfileAvatarProps) {
  const renderAvatarContent = () => {
    if (imageUri) {
      return (
        <Image
          source={{ uri: imageUri }}
          style={profileStyles.avatarImage}
          resizeMode="cover"
          onError={onImageError}
        />
      );
    }

    if (signedImageUrl && !imageError) {
      return (
        <Image
          source={{ uri: signedImageUrl }}
          style={profileStyles.avatarImage}
          resizeMode="cover"
          onError={onImageError}
        />
      );
    }

    return <InitialsAvatar name={userName} size="lg" />;
  };

  return (
    <View className="items-center py-10 rounded-3xl max-w-3xl w-full mx-auto dark:bg-background-dark light:bg-secondary-light">
      <TouchableOpacity
        onPress={onPress}
        disabled={uploading}
        activeOpacity={DEFAULT_ACTIVE_OPACITY}
      >
        <View style={profileStyles.avatarContainer}>
          {renderAvatarContent()}
          <UploadIndicator isUploading={uploading} />
          <View style={profileStyles.cameraIconContainer}>
            <Ionicons name="camera" size={PROFILE_SIZES.CAMERA_ICON} color={PROFILE_COLORS.WHITE} />
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
}
