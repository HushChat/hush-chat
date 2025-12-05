import React from "react";
import { TouchableOpacity, View, ImageStyle, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { IMessageAttachment } from "@/types/chat/types";
import { getFileType } from "@/utils/files/getFileType";
import { staticStyles } from "@/components/conversations/conversation-thread/message-list/file-upload/ImageGrid/imageGrid.styles";
import { useVideoThumbnails } from "@/hooks/useVideoThumbnails";

type TImageItemProps = {
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
}: TImageItemProps) => {
  const fileType = getFileType(attachment.originalFileName || attachment.indexedFileName || "");
  const isVideo = fileType === "video";

  const thumbnails = useVideoThumbnails([attachment]);
  const thumbnail = thumbnails[0];

  const imageSource = isVideo && thumbnail ? thumbnail : attachment.fileUrl;

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

      {isVideo && (
        <View style={styles.videoPlayIcon}>
          <View style={styles.playIconBackground}>
            <Ionicons name="play" size={20} color="#fff" />
          </View>
        </View>
      )}

      {showOverlay && remainingCount > 0 && (
        <View style={staticStyles.overlayContainer}>
          <AppText className="text-white font-semibold text-2xl">+{remainingCount}</AppText>
        </View>
      )}
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
});
