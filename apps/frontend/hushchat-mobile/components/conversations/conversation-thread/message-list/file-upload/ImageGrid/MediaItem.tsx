import React, { useMemo, useState } from "react";
import { TouchableOpacity, View, ImageStyle, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { IMessageAttachment } from "@/types/chat/types";
import { getFileType } from "@/utils/files/getFileType";
import { staticStyles } from "./imageGrid.styles";
import { AppText } from "@/components/AppText";

interface IMediaItemProps {
  attachment: IMessageAttachment;
  style: ImageStyle;
  onPress?: () => void;
  showOverlay?: boolean;
  remainingCount?: number;
  isCurrentUser: boolean;
  isStored?: boolean;
  isUploading?: boolean;
}

const PLAY_ICON_SIZE = 40;

const VideoPlayOverlay = () => (
  <View style={styles.videoPlayIcon}>
    <View style={styles.playIconBackground}>
      <Ionicons name="play" size={20} color="#fff" />
    </View>
  </View>
);

export const MediaItem = ({
  attachment,
  style,
  onPress,
  isCurrentUser,
  isStored,
  isUploading = false,
}: IMediaItemProps) => {
  const [hasError, setHasError] = useState<boolean>(false);

  const fileName = attachment.originalFileName || attachment.indexedFileName || "";
  const isVideo = getFileType(fileName) === "video";

  const isPendingUpload = isCurrentUser && !isStored && isUploading;

  const imageSource = useMemo(() => {
    if (isVideo) return;
    return attachment.fileUrl;
  }, [isVideo, attachment]);

  if (hasError) {
    return (
      <View>
        <AppText className="text-red-500 text-sm mt-1.5">Upload failed. Re-upload again</AppText>
      </View>
    );
  }

  if (isPendingUpload) {
    return (
      <View style={style} className="items-center justify-center">
        <AppText>Still uploading</AppText>
      </View>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      style={staticStyles.imageItemContainer}
    >
      <Image
        source={{ uri: imageSource }}
        placeholder={{ uri: imageSource }}
        style={style}
        contentFit="contain"
        cachePolicy="memory-disk"
        onError={() => !isVideo && setHasError(true)}
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
