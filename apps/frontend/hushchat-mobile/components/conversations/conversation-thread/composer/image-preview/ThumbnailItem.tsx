import React from "react";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { IThumbnailItemProps } from "@/types/chat/types";
import { getThumbnailDisplayUri, isAttachmentVideo } from "@/utils/mediaUtils";
import { useIsMobileLayout } from "@/hooks/useIsMobileLayout";

export const ThumbnailItem = ({
  attachment,
  index,
  isActive,
  thumbnailUri,
  onPress,
}: IThumbnailItemProps) => {
  const isVideo = isAttachmentVideo(attachment);
  const displayUri = getThumbnailDisplayUri(attachment, thumbnailUri);
  const isMobileLayout = useIsMobileLayout();

  const sizeClass = isMobileLayout ? "w-20 h-20" : "w-[60px] h-[60px]";
  const activeBorder = isActive
    ? "border-4 border-primary-light dark:border-primary-dark"
    : isMobileLayout
      ? "opacity-60 hover:opacity-100"
      : "border-transparent";

  return (
    <Pressable
      onPress={() => onPress(index)}
      accessibilityRole="button"
      accessibilityLabel={`View ${isVideo ? "video" : "image"} ${index + 1}`}
      className={isMobileLayout ? "cursor-pointer active:opacity-70" : "relative active:opacity-70"}
    >
      <View className={`rounded-lg overflow-hidden ${activeBorder}`}>
        <Image
          source={{ uri: displayUri }}
          contentFit="cover"
          className={`${sizeClass} rounded-lg border-2`}
        />

        {isVideo && (
          <View className="absolute inset-0 flex items-center justify-center bg-black/30">
            <Ionicons name="play-circle" size={isMobileLayout ? 24 : 20} color="#fafafa" />
          </View>
        )}
      </View>
    </Pressable>
  );
};

export default ThumbnailItem;
