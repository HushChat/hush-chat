import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Modal,
  View,
  Pressable,
  Dimensions,
  ScrollView,
  Image,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { GestureDetector, Gesture, GestureHandlerRootView } from "react-native-gesture-handler";
import Animated from "react-native-reanimated";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { VideoView, useVideoPlayer } from "expo-video";
import { scheduleOnRN } from "react-native-worklets";

import { IThumbnailStripBaseProps, TImagePreviewProps } from "@/types/chat/types";
import { useSwipeGesture } from "@/gestures/base/useSwipeGesture";
import { AppText } from "@/components/AppText";
import { MotionView } from "@/motion/MotionView";
import { useVideoThumbnails } from "@/hooks/useVideoThumbnails";
import { useMediaDownload } from "@/hooks/useMediaDownload";
import { useZoomPanGestures } from "@/gestures/base/useZoomPanGesture";
import { ThumbnailItem } from "@/components/conversations/conversation-thread/composer/image-preview/ThumbnailItem";
import { isAttachmentVideo, THUMBNAIL } from "@/utils/mediaUtils";
import { useImagePreviewNavigation } from "@/hooks/useImagePreviewHooks";
import { ConfirmDialog } from "@/components/conversations/conversation-thread/composer/image-preview/ConfirmDialog";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

interface IHeaderProps {
  currentIndex: number;
  totalCount: number;
  isDownloading: boolean;
  onDownload: () => void;
  onClose: () => void;
  topInset: number;
}

interface IVideoPlayerViewProps {
  url: string;
  hasMultipleImages: boolean;
}

const Header = ({
  currentIndex,
  totalCount,
  isDownloading,
  onDownload,
  onClose,
  topInset,
}: IHeaderProps) => (
  <MotionView
    visible
    preset="fadeIn"
    delay={100}
    className="absolute left-0 right-0 flex-row justify-between items-center px-5 pb-4 z-10 bg-white/90 dark:bg-black/90 backdrop-blur-sm"
    style={{ paddingTop: topInset + 10 }}
  >
    <AppText className="text-gray-900 dark:text-white text-base font-semibold">
      {currentIndex + 1} / {totalCount}
    </AppText>
    <View className="flex-row items-center gap-4">
      <Pressable
        onPress={onDownload}
        disabled={isDownloading}
        className="p-2 active:opacity-60"
        accessibilityLabel="Download media"
        accessibilityRole="button"
      >
        {isDownloading ? (
          <ActivityIndicator size="small" color="#6B7280" />
        ) : (
          <Ionicons name="download-outline" size={26} color="#6B7280" />
        )}
      </Pressable>
      <Pressable
        onPress={onClose}
        className="p-2 active:opacity-60"
        accessibilityLabel="Close preview"
        accessibilityRole="button"
      >
        <Ionicons name="close" size={28} color="#6B7280" />
      </Pressable>
    </View>
  </MotionView>
);

const VideoPlayerView = ({ url, hasMultipleImages }: IVideoPlayerViewProps) => {
  const player = useVideoPlayer(url, (p) => {
    p.loop = false;
    p.muted = false;
  });

  const maxHeight = hasMultipleImages ? SCREEN_HEIGHT - 200 : SCREEN_HEIGHT;

  return (
    <View className="w-full h-full justify-center items-center">
      <VideoView
        player={player}
        style={{
          width: "100%",
          height: "100%",
          maxWidth: SCREEN_WIDTH,
          maxHeight,
        }}
        contentFit="contain"
        nativeControls
        allowsPictureInPicture
      />
    </View>
  );
};

const ThumbnailStrip = ({
  attachments,
  currentIndex,
  thumbnails,
  onSelectIndex,
}: IThumbnailStripBaseProps) => (
  <MotionView
    visible
    preset="slideUp"
    delay={200}
    className="absolute bottom-0 left-0 right-0 p-5 bg-background-light dark:bg-background-dark border-t border-gray-200 dark:border-[#202C33]"
  >
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.thumbListContainer}
    >
      {attachments.map((attachment, idx) => (
        <ThumbnailItem
          key={attachment.id || idx}
          attachment={attachment}
          index={idx}
          isActive={currentIndex === idx}
          thumbnailUri={thumbnails[idx]}
          onPress={onSelectIndex}
        />
      ))}
    </ScrollView>
  </MotionView>
);

export const ImagePreview = ({ visible, images, initialIndex, onClose }: TImagePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const insets = useSafeAreaInsets();

  const currentAttachment = images[currentIndex];
  const isCurrentVideo = isAttachmentVideo(currentAttachment);
  const hasMultipleImages = images.length > 1;

  const { isZoomed, resetTransform, pinchGesture, panGesture, doubleTapGesture, animatedStyle } =
    useZoomPanGestures(!isCurrentVideo);

  const { isDownloading, dialogState, downloadMedia, handleConfirmSave, handleCancelDialog } =
    useMediaDownload();

  const videoThumbnails = useVideoThumbnails(visible ? images : [], currentIndex, {
    windowSize: 1,
  });

  const { handlePrevious, handleNext, handleSelectIndex, canGoPrevious, canGoNext } =
    useImagePreviewNavigation(currentIndex, setCurrentIndex, images.length, {
      onNavigate: resetTransform,
    });

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      resetTransform();
    }
  }, [initialIndex, visible, resetTransform]);

  const handleNavigate = useCallback(
    (direction: "prev" | "next") => {
      if (direction === "prev") handlePrevious();
      else handleNext();
    },
    [handlePrevious, handleNext]
  );

  const handleDownload = useCallback(() => {
    void downloadMedia(currentAttachment);
  }, [downloadMedia, currentAttachment]);

  const { gesture: swipeGesture } = useSwipeGesture({
    enabled: hasMultipleImages && !isZoomed.value,
    direction: "horizontal",
    trigger: 80,
    maxDrag: 100,
    onSwipeRight: () => {
      scheduleOnRN(handleNavigate, "prev");
    },
    onSwipeLeft: () => {
      scheduleOnRN(handleNavigate, "next");
    },
    allowLeft: canGoNext,
    allowRight: canGoPrevious,
  });

  const composedGesture = useMemo(() => {
    const panZoom = Gesture.Simultaneous(pinchGesture, panGesture);
    return Gesture.Exclusive(swipeGesture, Gesture.Race(doubleTapGesture, panZoom));
  }, [swipeGesture, pinchGesture, panGesture, doubleTapGesture]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      presentationStyle="overFullScreen"
    >
      <SafeAreaView style={styles.flex1} edges={["bottom"]}>
        <View className="flex-1 bg-white dark:bg-black">
          <Header
            currentIndex={currentIndex}
            totalCount={images.length}
            isDownloading={isDownloading}
            onDownload={handleDownload}
            onClose={onClose}
            topInset={insets.top}
          />

          <GestureHandlerRootView style={styles.flex1}>
            <View
              className="flex-1 justify-center items-center"
              style={hasMultipleImages ? styles.contentWithThumbnails : undefined}
            >
              {isCurrentVideo ? (
                <VideoPlayerView
                  url={currentAttachment?.fileUrl || ""}
                  hasMultipleImages={hasMultipleImages}
                />
              ) : (
                <GestureDetector gesture={composedGesture}>
                  <Animated.View style={[styles.imageContainer, animatedStyle]}>
                    <Image
                      source={{ uri: currentAttachment?.fileUrl }}
                      className="w-full h-full"
                      resizeMode="contain"
                    />
                  </Animated.View>
                </GestureDetector>
              )}
            </View>
          </GestureHandlerRootView>

          {hasMultipleImages && (
            <ThumbnailStrip
              attachments={images}
              currentIndex={currentIndex}
              thumbnails={videoThumbnails}
              onSelectIndex={handleSelectIndex}
            />
          )}

          <ConfirmDialog
            visible={dialogState.visible}
            onCancel={handleCancelDialog}
            onConfirm={handleConfirmSave}
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  contentWithThumbnails: {
    paddingBottom: 100,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  thumbListContainer: {
    gap: THUMBNAIL.GAP,
  },
});

export default ImagePreview;
