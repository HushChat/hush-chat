import React, { useState, useEffect, useMemo } from "react";
import { StyleSheet, View, TouchableOpacity } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { getInitials } from "@/utils/commonUtils";
import { AppText } from "@/components/AppText";
import { chatUserStatus, DeviceType } from "@/types/chat/types";
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
  deviceType?: DeviceType;
}

const sizeClasses: Record<AvatarSizeType, { container: string; text: string }> = {
  esm: { container: "w-8 h-8", text: "text-xs" },
  sm: { container: "w-10 h-10", text: "text-base" },
  md: { container: "w-12 h-12", text: "text-lg" },
  lg: { container: "w-40 h-40", text: "text-6xl" },
};

const AVATAR_PALETTE = [
  "#6B4EFF", // purple (brand)
  "#3B82F6", // blue
  "#10B981", // emerald
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#14B8A6", // teal
  "#F97316", // orange
  "#6366F1", // indigo
];

const getAvatarColor = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
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
  onImageError,
  showCameraIcon = false,
  isUploading = false,
  onPress,
  deviceType,
}: IInitialsAvatarProps) => {
  const { container, text } = sizeClasses[size];
  const [hasError, setHasError] = useState<boolean>(false);
  const avatarBgColor = useMemo(() => getAvatarColor(name || ""), [name]);

  useEffect(() => {
    setHasError(false);
  }, [imageUrl]);

  const handleImageError = () => {
    setHasError(true);
    if (onImageError) {
      onImageError();
    }
  };

  const shouldShowImage = imageUrl && !hasError;

  const Wrapper = onPress ? TouchableOpacity : View;
  const wrapperProps = onPress ? { onPress, disabled: isUploading } : {};

  return (
    <Wrapper {...wrapperProps}>
      <View style={styles.container}>
        <View
          className={`${container} rounded-full items-center justify-center`}
          style={!shouldShowImage ? { backgroundColor: avatarBgColor } : undefined}
        >
          {shouldShowImage ? (
            <Image
              source={{ uri: imageUrl }}
              placeholder={{ uri: imageUrl }}
              style={styles.avatarImage}
              contentFit="cover"
              cachePolicy="memory-disk"
              onError={handleImageError}
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

        {showOnlineStatus && (
          <UserStatusIndicator userStatus={userStatus} deviceType={deviceType} />
        )}
      </View>
    </Wrapper>
  );
};

export default InitialsAvatar;
