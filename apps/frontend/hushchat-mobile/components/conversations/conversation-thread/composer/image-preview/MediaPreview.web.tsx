import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Modal, View, Pressable, ScrollView } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";

import { TImagePreviewProps, IMessageAttachment, TNavigationDirection } from "@/types/chat/types";
import { AppText } from "@/components/AppText";
import { isAttachmentVideo, THUMBNAIL } from "@/utils/mediaUtils";
import {
  useImagePreviewNavigation,
  useKeyboardNavigation,
  useThumbnailScroll,
} from "@/hooks/useImagePreviewHooks";
import { VideoPlayer } from "@/components/conversations/conversation-thread/message-list/file-upload/ImageGrid/VideoPlayer";
import { useConversationStore } from "@/store/conversation/useConversationStore";
import { getAttachmentDownloadUrl } from "@/apis/conversation";
import { downloadFileWeb } from "@/utils/messageUtils";
import { ToastUtils } from "@/utils/toastUtils";
import { useAppTheme } from "@/hooks/useAppTheme";

interface IHeaderProps {
  fileName: string;
  isVideo: boolean;
  currentIndex: number;
  totalCount: number;
  isDownloading: boolean;
  onDownload: () => void;
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

const Header = ({
  fileName,
  isVideo,
  currentIndex,
  totalCount,
  isDownloading,
  onDownload,
  onClose,
}: IHeaderProps) => {
  const isDark = useAppTheme();
  const themeColors = {
    primary: isDark ? "#563dc4" : "#6B4EFF",
    icon: isDark ? "#9ca3af" : "#6B7280",
  };

  return (
    <View className="bg-background-light dark:bg-background-dark px-6 py-4 flex-row justify-between items-center">
      <View className="flex-1">
        <AppText className="text-gray-900 dark:text-white text-base font-normal" numberOfLines={1}>
          {fileName || (isVideo ? "Video" : "Image")}
        </AppText>
        <AppText className="text-gray-500 dark:text-[#8696A0] text-sm mt-0.5">
          {currentIndex + 1} of {totalCount}
        </AppText>
      </View>
      <View className="flex-row gap-2 ml-4">
        <Pressable
          onPress={onDownload}
          disabled={isDownloading}
          className="p-2 active:opacity-60 cursor-pointer"
          accessibilityLabel="Download media"
          accessibilityRole="button"
        >
          {isDownloading ? (
            <ActivityIndicator size="small" color={themeColors.icon} />
          ) : (
            <Ionicons name="download-outline" size={24} color={themeColors.primary} />
          )}
        </Pressable>
        <Pressable
          onPress={onClose}
          className="p-2 active:opacity-60 cursor-pointer"
          accessibilityLabel="Close preview"
          accessibilityRole="button"
        >
          <Ionicons name="close" size={24} color={themeColors.icon} />
        </Pressable>
      </View>
    </View>
  );
};

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

export const MediaPreview = ({ visible, images, initialIndex, onClose }: TImagePreviewProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isDownloading, setIsDownloading] = useState(false);
  const thumbnailScrollRef = useRef<ScrollView>(null);
  const selectedConversationId = useConversationStore((s) => s.selectedConversationId);

  const currentAttachment = images[currentIndex];
  const currentFileName = currentAttachment?.originalFileName || "";
  const isCurrentVideo = isAttachmentVideo(currentAttachment);
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  const { handlePrevious, handleNext, canGoPrevious, canGoNext } = useImagePreviewNavigation(
    currentIndex,
    setCurrentIndex,
    images.length,
    {
      wrapNavigation: true,
    }
  );

  useKeyboardNavigation(visible, onClose, handlePrevious, handleNext);
  useThumbnailScroll(thumbnailScrollRef, currentIndex, images.length, {
    thumbnailSize: THUMBNAIL.SIZE_WEB,
  });

  const handleDownload = useCallback(async () => {
    if (!currentAttachment) return;
    const fileName = currentAttachment.originalFileName || "download";
    setIsDownloading(true);
    try {
      let url = currentAttachment.fileUrl;
      if (currentAttachment.id && selectedConversationId) {
        url = await getAttachmentDownloadUrl(selectedConversationId, currentAttachment.id);
      }
      await downloadFileWeb(url, fileName);
    } catch {
      ToastUtils.error("Failed to download file");
    } finally {
      setIsDownloading(false);
    }
  }, [currentAttachment, selectedConversationId]);

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
          isDownloading={isDownloading}
          onDownload={handleDownload}
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
      </View>
    </Modal>
  );
};

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
