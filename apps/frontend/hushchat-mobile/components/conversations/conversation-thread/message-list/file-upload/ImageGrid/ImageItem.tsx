import React from "react";
import { TouchableOpacity, View, ImageStyle } from "react-native";
import { Image } from "expo-image";

import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { IMessageAttachment } from "@/types/chat/types";

import { staticStyles } from "./imageGrid.styles";

type ImageItemProps = {
  attachment: IMessageAttachment;
  style: ImageStyle;
  onPress?: () => void;
  showOverlay?: boolean;
  remainingCount?: number;
};

export const ImageItem = ({
  attachment,
  style,
  onPress,
  showOverlay = false,
  remainingCount = 0,
}: ImageItemProps) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={DEFAULT_ACTIVE_OPACITY}
    style={staticStyles.imageItemContainer}
  >
    <Image
      source={{ uri: attachment.fileUrl }}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
    />

    {showOverlay && remainingCount > 0 && (
      <View style={staticStyles.overlayContainer}>
        <AppText className="text-white font-semibold text-2xl">+{remainingCount}</AppText>
      </View>
    )}
  </TouchableOpacity>
);
