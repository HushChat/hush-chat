import { View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { getInitials } from "@/utils/commonUtils";
import { AppText } from "@/components/AppText";

export const AvatarSize = {
  extraSmall: "esm",
  small: "sm",
  medium: "md",
  large: "lg",
} as const;

type AvatarSizeType = (typeof AvatarSize)[keyof typeof AvatarSize];

interface InitialsAvatarProps {
  name: string;
  size?: AvatarSizeType;
  imageUrl?: string | null;
}

const sizeClasses: Record<AvatarSizeType, { container: string; text: string }> = {
  esm: { container: "w-8 h-8", text: "text-xs" },
  sm: { container: "w-10 h-10", text: "text-base" },
  md: { container: "w-12 h-12", text: "text-lg" },
  lg: { container: "w-40 h-40", text: "text-6xl" },
};

const InitialsAvatar = ({ name, size = AvatarSize.medium, imageUrl }: InitialsAvatarProps) => {
  const { container, text } = sizeClasses[size];

  return (
    <View
      className={`${container} rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center`}
    >
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={{ width: "100%", height: "100%", borderRadius: 150 }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />
      ) : (
        <AppText className={`font-medium text-center ${text}`} style={{ color: "#FFFFFF" }}>
          {getInitials(name)}
        </AppText>
      )}
    </View>
  );
};

export default InitialsAvatar;
