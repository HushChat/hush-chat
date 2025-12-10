import React from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { getInitials } from "@/utils/commonUtils";
import { AppText } from "@/components/AppText";
import { chatUserStatus } from "@/types/chat/types";
import UserStatusIndicator from "@/components/UserStatusIndicator";
import UploadIndicator from "@/components/UploadIndicator";

export const AvatarSize = {
  extraSmall: "esm",
  small: "sm",
  medium: "md",
  large: "lg",
} as const;

type AvatarSizeType = (typeof AvatarSize)[keyof typeof AvatarSize];

interface IInitialsAvatarProps {
  name: string;
  size?: AvatarSizeType;
  imageUrl?: string | null;
  userStatus?: chatUserStatus;
  showOnlineStatus?: boolean;
  imageError?: boolean;
  onImageError?: () => void;
  showCameraIcon?: boolean;
  isUploading?: boolean;
  onPress?: () => void;
}

const sizeClasses: Record<AvatarSizeType, { container: string; text: string }> = {
  esm: { container: "w-8 h-8", text: "text-xs" },
  sm: { container: "w-10 h-10", text: "text-base" },
  md: { container: "w-12 h-12", text: "text-lg" },
  lg: { container: "w-40 h-40", text: "text-6xl" },
};

const COLORS = {
  INITIALS_TEXT: "#FFFFFF",
};

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 150,
  },
  initialsText: {
    color: COLORS.INITIALS_TEXT,
  },
  cameraBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "#6B4EFF",
    padding: 8,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: "#090F1D",
  },
});

const InitialsAvatar = ({
  name,
  size = AvatarSize.medium,
  imageUrl,
  userStatus = chatUserStatus.OFFLINE,
  showOnlineStatus = false,
  imageError = false,
  onImageError,
  showCameraIcon = false,
  isUploading = false,
  onPress,
}: IInitialsAvatarProps) => {
  const { container, text } = sizeClasses[size];

  const shouldShowImage = imageUrl && !imageError;

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, disabled: isUploading } : {};

  return (
    <Wrapper {...wrapperProps}>
      <View style={styles.container}>
        <View
          className={`${container} rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center`}
        >
          {shouldShowImage ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.avatarImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              onError={onImageError}
            />
          ) : (
            <AppText className={`font-medium text-center ${text}`} style={styles.initialsText}>
              {getInitials(name)}
            </AppText>
          )}
        </View>

        {isUploading && <UploadIndicator isUploading={true} />}

        {showCameraIcon && (
          <View style={styles.cameraBadge}>
            <Ionicons name="camera" size={15} color="#fafafa" />
          </View>
        )}

        {showOnlineStatus && <UserStatusIndicator userStatus={userStatus} />}
      </View>
    </Wrapper>
  );
};

export default InitialsAvatar;
