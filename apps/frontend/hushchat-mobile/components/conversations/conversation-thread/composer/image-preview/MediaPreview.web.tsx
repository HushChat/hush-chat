import React, { useEffect, useRef, useState } from "react";
import { Modal, View, Pressable, ScrollView, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import {
  TImagePreviewProps,
  IMessageAttachment,
  TNavigationDirection,
  IThumbnailStripBaseProps,
} from "@/types/chat/types";
import { AppText } from "@/components/AppText";
import { useVideoThumbnails } from "@/hooks/useVideoThumbnails";
import { isAttachmentVideo, THUMBNAIL } from "@/utils/mediaUtils";
import { ThumbnailItem } from "@/components/conversations/conversation-thread/composer/image-preview/ThumbnailItem";
import {
  useImagePreviewNavigation,
  useKeyboardNavigation,
  useThumbnailScroll,
} from "@/hooks/useImagePreviewHooks";
import { VideoPlayer } from "@/components/conversations/conversation-thread/message-list/file-upload/ImageGrid/VideoPlayer";

interface IHeaderProps {
  fileName: string;
  isVideo: boolean;
  currentIndex: number;
  totalCount: number;
  onClose: () => void;
}

interface INavigationButtonProps {
  direction: TNavigationDirection;
  onPress: () => void;
}

interface IMediaViewerProps {
  attachment: IMessageAttachment | undefined;
  isVideo: boolean;
}

const Header = ({ fileName, isVideo, currentIndex, totalCount, onClose }: IHeaderProps) => (
  <View className="bg-background-light dark:bg-background-dark px-6 py-4 flex-row justify-between items-center">
    <View className="flex-1">
      <AppText className="text-gray-900 dark:text-white text-base font-normal" numberOfLines={1}>
        {fileName || (isVideo ? "Video" : "Image")}
      </AppText>
      <AppText className="text-gray-500 dark:text-[#8696A0] text-sm mt-0.5">
        {currentIndex + 1} of {totalCount}
      </AppText>
    </View>
    <Pressable
      onPress={onClose}
      className="p-2 active:opacity-60 cursor-pointer ml-4"
      accessibilityLabel="Close preview"
      accessibilityRole="button"
    >
      <Ionicons name="close" size={24} color="#8696A0" />
    </Pressable>
  </View>
);

const NavigationButton = ({ direction, onPress }: INavigationButtonProps) => {
  const iconName = direction === "prev" ? "chevron-back" : "chevron-forward";

  return (
    <View className="justify-center items-center w-20">
      <Pressable
        onPress={onPress}
        className="bg-background-light dark:bg-background-dark hover:bg-gray-200 dark:hover:bg-[#2A3942] p-3 rounded-full active:opacity-80 cursor-pointer"
        accessibilityLabel={direction === "prev" ? "Previous" : "Next"}
        accessibilityRole="button"
      >
        <Ionicons name={iconName} size={24} color="#6B7280" />
      </Pressable>
    </View>
  );
};

const MediaViewer = ({ attachment, isVideo }: IMediaViewerProps) => {
  if (isVideo) {
    return <VideoPlayer uri={attachment?.fileUrl} style={videoStyles.player} />;
  }

  return (
    <Image
      source={{ uri: attachment?.fileUrl }}
      className="w-full h-full"
      contentFit="contain"
      cachePolicy="memory-disk"
    />
  );
};

interface IThumbnailStripWebProps extends IThumbnailStripBaseProps {
  scrollRef: React.RefObject<ScrollView | null>;
}

const ThumbnailStrip = ({
  attachments,
  currentIndex,
  thumbnails,
  onSelectIndex,
  scrollRef,
}: IThumbnailStripWebProps) => {
  return (
    <View className="bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-[#202C33] py-4">
      <View className="items-center justify-center">
        <ScrollView
          ref={scrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.thumbnailScroll}
        >
          {attachments.map((attachment, index) => (
            <ThumbnailItem
              key={attachment.id || index}
              attachment={attachment}
              index={index}
              isActive={currentIndex === index}
              thumbnailUri={thumbnails[index]}
              onPress={onSelectIndex}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

export const MediaPreview = ({ visible, images, initialIndex, onClose }: TImagePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const thumbnailScrollRef = useRef<ScrollView>(null);

  const currentAttachment = images[currentIndex];
  const currentFileName = currentAttachment?.originalFileName || "";
  const isCurrentVideo = isAttachmentVideo(currentAttachment);
  const hasMultipleImages = images.length > 1;

  const videoThumbnails = useVideoThumbnails(visible ? images : [], currentIndex, {
    windowSize: 1,
  });

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const { handlePrevious, handleNext, handleSelectIndex, canGoPrevious, canGoNext } =
    useImagePreviewNavigation(currentIndex, setCurrentIndex, images.length, {
      wrapNavigation: true,
    });

  useKeyboardNavigation(visible, onClose, handlePrevious, handleNext);
  useThumbnailScroll(thumbnailScrollRef, currentIndex, images.length, {
    thumbnailSize: THUMBNAIL.SIZE_WEB,
  });

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View className="flex-1 bg-background-light dark:bg-background-dark">
        <Header
          fileName={currentFileName}
          isVideo={isCurrentVideo}
          currentIndex={currentIndex}
          totalCount={images.length}
          onClose={onClose}
        />

        <View className="flex-1 flex-row bg-background-light dark:bg-background-dark">
          {hasMultipleImages && canGoPrevious && (
            <NavigationButton direction="prev" onPress={handlePrevious} />
          )}

          <View className="flex-1 justify-center items-center p-4">
            <MediaViewer attachment={currentAttachment} isVideo={isCurrentVideo} />
          </View>

          {hasMultipleImages && canGoNext && (
            <NavigationButton direction="next" onPress={handleNext} />
          )}
        </View>

        {hasMultipleImages && (
          <ThumbnailStrip
            attachments={images}
            currentIndex={currentIndex}
            thumbnails={videoThumbnails}
            onSelectIndex={handleSelectIndex}
            scrollRef={thumbnailScrollRef}
          />
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  thumbnailScroll: {
    maxWidth: "100%",
  },
});

const videoStyles = {
  player: {
    maxWidth: "100%",
    maxHeight: "100%",
    width: "auto",
    height: "auto",
    objectFit: "contain" as const,
  },
};

export default MediaPreview;
