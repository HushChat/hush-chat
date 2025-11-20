import { StyleSheet, View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { getInitials } from "@/utils/commonUtils";
import { AppText } from "@/components/AppText";
import { chatUserStatus } from "@/types/chat/types";

export const AvatarSize = {
  small: "sm",
  medium: "md",
  large: "lg",
} as const;

type AvatarSizeType = (typeof AvatarSize)[keyof typeof AvatarSize];

interface InitialsAvatarProps {
  name: string;
  size?: AvatarSizeType;
  imageUrl?: string | null;
  userStatus?: chatUserStatus;
  showOnlineStatus?: boolean;
}

const sizeClasses: Record<AvatarSizeType, { container: string; text: string }> = {
  sm: { container: "w-10 h-10", text: "text-base" },
  md: { container: "w-12 h-12", text: "text-lg" },
  lg: { container: "w-40 h-40", text: "text-6xl" },
};

const COLORS = {
  INITIALS_TEXT: "#FFFFFF",
};

const styles = StyleSheet.create({
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 150,
  },
  initialsText: {
    color: COLORS.INITIALS_TEXT,
  },
});

const StatusColorMap: Record<string, string> = {
  [chatUserStatus.ONLINE]: "#22C55E",
  [chatUserStatus.OFFLINE]: "#9CA3AF",
  [chatUserStatus.AWAY]: "#F59E0B",
  [chatUserStatus.BUSY]: "#EF4444",
};

const getStatusColor = (status: string): string => {
  return StatusColorMap[status] || "#9CA3AF";
};

const InitialsAvatar = ({
  name,
  size = AvatarSize.medium,
  imageUrl,
  userStatus = chatUserStatus.OFFLINE,
  showOnlineStatus = false,
}: InitialsAvatarProps) => {
  const { container, text } = sizeClasses[size];

  return (
    <View style={{ position: "relative" }}>
      <View
        className={`${container} rounded-full bg-primary-light dark:bg-primary-dark items-center justify-center`}
      >
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.avatarImage}
            contentFit="cover"
            cachePolicy="memory-disk"
          />
        ) : (
          <AppText className={`font-medium text-center ${text}`} style={styles.initialsText}>
            {getInitials(name)}
          </AppText>
        )}
      </View>

      {showOnlineStatus && (
        <View
          className="absolute bottom-0 right-0 border-white w-[12px] h-[12px] rounded-full border-2 bg-[getStatusColor(userStatus)]"
          style={{
            backgroundColor: getStatusColor(userStatus),
          }}
        />
      )}
    </View>
  );
};

export default InitialsAvatar;
