import React, { useMemo } from "react";
import { TouchableOpacity, View, ImageStyle, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { IMessageAttachment } from "@/types/chat/types";
import { getFileType } from "@/utils/files/getFileType";
import { staticStyles } from "./imageGrid.styles";

interface IMediaItemProps {
  attachment: IMessageAttachment;
  style: ImageStyle;
  onPress?: () => void;
  showOverlay?: boolean;
  remainingCount?: number;
}

const PLAY_ICON_SIZE = 40;

const VideoPlayOverlay = () => (
  <View style={styles.videoPlayIcon}>
    <View style={styles.playIconBackground}>
      <Ionicons name="play" size={20} color="#fff" />
    </View>
  </View>
);

export const MediaItem = ({ attachment, style, onPress }: IMediaItemProps) => {
  const fileName = attachment.originalFileName || attachment.indexedFileName || "";
  const isVideo = getFileType(fileName) === "video";

  const imageSource = useMemo(() => {
    if (isVideo) return;
    return attachment.fileUrl;
  }, [isVideo, attachment]);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      style={staticStyles.imageItemContainer}
    >
      <Image
        source={{ uri: imageSource }}
        style={style}
        contentFit="cover"
        cachePolicy="memory-disk"
      />

      {isVideo && <VideoPlayOverlay />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  videoPlayIcon: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  playIconBackground: {
    width: PLAY_ICON_SIZE,
    height: PLAY_ICON_SIZE,
    borderRadius: PLAY_ICON_SIZE / 2,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
