import React, { useMemo } from "react";
import { TouchableOpacity, View, ImageStyle, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { IMessageAttachment } from "@/types/chat/types";
import { getFileType } from "@/utils/files/getFileType";
import { staticStyles } from "@/components/conversations/conversation-thread/message-list/file-upload/ImageGrid/imageGrid.styles";
import { useVideoThumbnails } from "@/hooks/useVideoThumbnails";

interface IMediaItemProps {
  attachment: IMessageAttachment;
  style: ImageStyle;
  onPress?: () => void;
  showOverlay?: boolean;
  remainingCount?: number;
}

const PLAY_ICON_SIZE = 40;
const PLAY_ICON_INNER_SIZE = 20;

const VideoPlayOverlay = () => (
  <View style={styles.videoPlayIcon}>
    <View style={styles.playIconBackground}>
      <Ionicons name="play" size={PLAY_ICON_INNER_SIZE} color="#fff" />
    </View>
  </View>
);

const RemainingCountOverlay = ({ count }: { count: number }) => (
  <View style={staticStyles.overlayContainer}>
    <AppText className="text-white font-semibold text-2xl">+{count}</AppText>
  </View>
);

export const MediaItem = ({
  attachment,
  style,
  onPress,
  showOverlay = false,
  remainingCount = 0,
}: IMediaItemProps) => {
  const fileName = attachment.originalFileName || attachment.indexedFileName || "";
  const fileType = getFileType(fileName);
  const isVideo = fileType === "video";

  const attachments = useMemo(() => (isVideo ? [attachment] : []), [isVideo, attachment]);

  const thumbnails = useVideoThumbnails(attachments, 0, { windowSize: 0 });

  const imageSource = useMemo(() => {
    if (isVideo && thumbnails[0]) {
      return thumbnails[0];
    }
    return attachment.fileUrl;
  }, [isVideo, thumbnails, attachment.fileUrl]);

  const shouldShowRemainingOverlay = showOverlay && remainingCount > 0;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      style={staticStyles.imageItemContainer}
      accessibilityLabel={isVideo ? "Video" : "Image"}
      accessibilityRole="button"
    >
      <Image
        source={{ uri: imageSource }}
        placeholder={{ uri: imageSource }}
        style={style}
        contentFit="contain"
        cachePolicy="memory-disk"
      />

      {isVideo && <VideoPlayOverlay />}

      {shouldShowRemainingOverlay && <RemainingCountOverlay count={remainingCount} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  videoPlayIcon: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  playIconBackground: {
    width: PLAY_ICON_SIZE,
    height: PLAY_ICON_SIZE,
    borderRadius: PLAY_ICON_SIZE / 2,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});

export default MediaItem;
