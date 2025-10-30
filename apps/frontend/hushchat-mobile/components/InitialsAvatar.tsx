/**
 * Copyright (c) 2025, HushChat (https://gethush.chat)
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import { View } from "react-native";
import React from "react";
import { Image } from "expo-image";
import { getInitials } from "@/utils/commonUtils";
import { AppText } from "@/components/AppText";

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
}

const sizeClasses: Record<AvatarSizeType, { container: string; text: string }> =
  {
    sm: { container: "w-10 h-10", text: "text-base" },
    md: { container: "w-12 h-12", text: "text-lg" },
    lg: { container: "w-40 h-40", text: "text-6xl" },
  };

const InitialsAvatar = ({
  name,
  size = AvatarSize.medium,
  imageUrl,
}: InitialsAvatarProps) => {
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
        <AppText
          className={`font-medium text-center ${text}`}
          style={{ color: "#FFFFFF" }}
        >
          {getInitials(name)}
        </AppText>
      )}
    </View>
  );
};

export default InitialsAvatar;
