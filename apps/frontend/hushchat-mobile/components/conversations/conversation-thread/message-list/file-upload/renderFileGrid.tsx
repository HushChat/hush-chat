/**
 * renderFileGrid.tsx
 * Updated with image preview functionality
 */

import React, { useState } from "react";
import { IMessageAttachment } from "@/types/chat/types";
import { TouchableOpacity, View, ViewStyle, ImageStyle, Linking, StyleSheet } from "react-native";
import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import { useColorScheme } from "nativewind";
import { AppText } from "@/components/AppText";
import { DEFAULT_ACTIVE_OPACITY } from "@/constants/ui";
import { ImagePreview } from "@/components/conversations/conversation-thread/composer/image-preview/ImagePreview";

const GRID_CONFIG = {
  MAX_WIDTH: 280,
  MAX_HEIGHT: 280,
  SINGLE_IMAGE_MAX_HEIGHT: 350,
  IMAGE_GAP: 2,
  BORDER_RADIUS: 8,
  MAX_DISPLAY_IMAGES: 4,
} as const;

const COLORS = {
  OVERLAY_DARK: "rgba(0,0,0,0.65)",
};

const createImageStyle = (width: number, height: number): ImageStyle => ({
  width,
  height,
  borderRadius: GRID_CONFIG.BORDER_RADIUS,
});

const staticStyles = StyleSheet.create({
  gap: {
    gap: GRID_CONFIG.IMAGE_GAP,
  },
  singleImageContainer: {
    overflow: "hidden",
    borderRadius: GRID_CONFIG.BORDER_RADIUS,
  },
  overlayContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: COLORS.OVERLAY_DARK,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: GRID_CONFIG.BORDER_RADIUS,
  },
  imageItemContainer: {
    position: "relative",
  },
  documentCardRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  documentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  documentIconText: {
    fontSize: 8,
    fontWeight: "bold",
    marginTop: 2,
  },
  documentTextContainer: {
    flex: 1,
    minWidth: 0,
  },
  documentTitle: {
    fontSize: 12,
    fontWeight: "600",
  },
  documentSubtitle: {
    fontSize: 10,
    marginTop: 2,
  },
  documentDownloadContainer: {
    marginLeft: 8,
  },
});

const dynamicStyles = {
  container: (isCurrentUser: boolean): ViewStyle => ({
    maxWidth: GRID_CONFIG.MAX_WIDTH,
    alignSelf: isCurrentUser ? "flex-end" : "flex-start",
  }),

  singleImage: (aspectRatio: number): ImageStyle => {
    const maxWidth = GRID_CONFIG.MAX_WIDTH;
    const maxHeight = GRID_CONFIG.SINGLE_IMAGE_MAX_HEIGHT;

    let width = maxWidth;
    let height = width / aspectRatio;

    if (height > maxHeight) {
      height = maxHeight;
      width = height * aspectRatio;
    }

    return {
      width,
      height,
      borderRadius: GRID_CONFIG.BORDER_RADIUS,
    };
  },

  twoImagesImage: createImageStyle(
    (GRID_CONFIG.MAX_WIDTH - GRID_CONFIG.IMAGE_GAP) / 2,
    GRID_CONFIG.MAX_HEIGHT / 1.5
  ),

  threeImagesLarge: createImageStyle(
    (GRID_CONFIG.MAX_WIDTH - GRID_CONFIG.IMAGE_GAP) / 2,
    GRID_CONFIG.MAX_HEIGHT / 1.3
  ),

  threeImagesSmall: createImageStyle(
    (GRID_CONFIG.MAX_WIDTH - GRID_CONFIG.IMAGE_GAP) / 2,
    (GRID_CONFIG.MAX_HEIGHT / 1.3 - GRID_CONFIG.IMAGE_GAP) / 2
  ),

  fourImagesImage: createImageStyle(
    (GRID_CONFIG.MAX_WIDTH - GRID_CONFIG.IMAGE_GAP) / 2,
    (GRID_CONFIG.MAX_HEIGHT - GRID_CONFIG.IMAGE_GAP) / 2
  ),

  documentCard: (isCurrentUser: boolean, bgColor: string, borderColor: string): ViewStyle => ({
    maxWidth: GRID_CONFIG.MAX_WIDTH,
    padding: 12,
    backgroundColor: bgColor,
    borderRadius: GRID_CONFIG.BORDER_RADIUS,
    borderWidth: 1,
    borderColor,
    alignSelf: isCurrentUser ? "flex-end" : "flex-start",
  }),

  documentIconText: (color: string) => ({
    ...staticStyles.documentIconText,
    color,
  }),

  documentTitle: (color: string) => ({
    ...staticStyles.documentTitle,
    color,
  }),

  documentSubtitle: (color: string) => ({
    ...staticStyles.documentSubtitle,
    color,
  }),

  documentSpacing: (hasMultipleDocs: boolean, hasImages: boolean): ViewStyle => ({
    marginBottom: hasMultipleDocs || hasImages ? 8 : 0,
  }),
} as const;

const getFileType = (
  attachment: IMessageAttachment
): "image" | "pdf" | "word" | "excel" | "unknown" => {
  const fileName = attachment.originalFileName || attachment.indexedFileName || "";
  const ext = fileName.toLowerCase().split(".").pop();

  if (["jpg", "jpeg", "png", "svg", "gif", "webp"].includes(ext || "")) return "image";
  if (ext === "pdf") return "pdf";
  if (["doc", "docx"].includes(ext || "")) return "word";
  if (["xls", "xlsx"].includes(ext || "")) return "excel";

  return "unknown";
};

// Document Card Component
const DocumentCard = ({
  attachment,
  isCurrentUser,
}: {
  attachment: IMessageAttachment;
  isCurrentUser: boolean;
}) => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";

  const fileType = getFileType(attachment);
  const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
    pdf: { label: "PDF", icon: "document-text", color: "#6B4EFF" },
    word: { label: "WORD", icon: "document-text", color: "#2B6CB0" },
    excel: { label: "EXCEL", icon: "document-text", color: "#16A34A" },
    unknown: { label: "FILE", icon: "document-text", color: "#6B7280" },
  };

  const { label, icon, color } = typeLabels[fileType] || typeLabels.unknown;
  const bgColor = isDark ? "rgba(86, 61, 196, 0.25)" : "rgba(107, 78, 255, 0.15)";
  const borderColor = isDark ? "rgba(86, 61, 196, 0.4)" : "rgba(107, 78, 255, 0.3)";
  const textPrimary = isDark ? "#ffffff" : "#111827";
  const textSecondary = isDark ? "#9ca3af" : "#6B7280";

  const handlePress = () => {
    if (attachment.fileUrl) Linking.openURL(attachment.fileUrl);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      style={dynamicStyles.documentCard(isCurrentUser, bgColor, borderColor)}
    >
      <View style={staticStyles.documentCardRow}>
        <View style={staticStyles.documentIconContainer}>
          <Ionicons name={icon as any} size={20} color={color} />
          <AppText style={dynamicStyles.documentIconText(color)}>{label}</AppText>
        </View>
        <View style={staticStyles.documentTextContainer}>
          <AppText numberOfLines={2} style={dynamicStyles.documentTitle(textPrimary)}>
            {attachment.originalFileName || "Document"}
          </AppText>
          <AppText style={dynamicStyles.documentSubtitle(textSecondary)}>{label} Document</AppText>
        </View>
        <View style={staticStyles.documentDownloadContainer}>
          <Ionicons name="download-outline" size={16} color={color} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const ImageItem = ({
  attachment,
  style,
  onPress,
  showOverlay = false,
  remainingCount = 0,
}: {
  attachment: IMessageAttachment;
  style: ImageStyle;
  onPress?: () => void;
  showOverlay?: boolean;
  remainingCount?: number;
}) => (
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

const ImageGrid = ({
  images,
  onImagePress,
}: {
  images: IMessageAttachment[];
  onImagePress: (index: number) => void;
}) => {
  const displayImages = images.slice(0, GRID_CONFIG.MAX_DISPLAY_IMAGES);
  const remainingCount = Math.max(0, images.length - GRID_CONFIG.MAX_DISPLAY_IMAGES);
  const aspectRatio = 4 / 3;

  const renderSingleImage = () => (
    <View style={staticStyles.singleImageContainer}>
      <ImageItem
        attachment={displayImages[0]}
        style={dynamicStyles.singleImage(aspectRatio)}
        onPress={() => onImagePress(0)}
      />
    </View>
  );

  const renderTwoImages = () => (
    <View className="flex-row" style={staticStyles.gap}>
      <ImageItem
        attachment={displayImages[0]}
        style={dynamicStyles.twoImagesImage}
        onPress={() => onImagePress(0)}
      />
      <ImageItem
        attachment={displayImages[1]}
        style={dynamicStyles.twoImagesImage}
        onPress={() => onImagePress(1)}
      />
    </View>
  );

  const renderThreeImages = () => (
    <View className="flex-row" style={staticStyles.gap}>
      <ImageItem
        attachment={displayImages[0]}
        style={dynamicStyles.threeImagesLarge}
        onPress={() => onImagePress(0)}
      />
      <View style={staticStyles.gap}>
        <ImageItem
          attachment={displayImages[1]}
          style={dynamicStyles.threeImagesSmall}
          onPress={() => onImagePress(1)}
        />
        <ImageItem
          attachment={displayImages[2]}
          style={dynamicStyles.threeImagesSmall}
          onPress={() => onImagePress(2)}
        />
      </View>
    </View>
  );

  const renderFourOrMoreImages = () => (
    <View className="flex-row" style={staticStyles.gap}>
      <View style={staticStyles.gap}>
        <ImageItem
          attachment={displayImages[0]}
          style={dynamicStyles.fourImagesImage}
          onPress={() => onImagePress(0)}
        />
        <ImageItem
          attachment={displayImages[1]}
          style={dynamicStyles.fourImagesImage}
          onPress={() => onImagePress(1)}
        />
      </View>
      <View style={staticStyles.gap}>
        <ImageItem
          attachment={displayImages[2]}
          style={dynamicStyles.fourImagesImage}
          onPress={() => onImagePress(2)}
        />
        <ImageItem
          attachment={displayImages[3]}
          style={dynamicStyles.fourImagesImage}
          onPress={() => onImagePress(3)}
          showOverlay={remainingCount > 0}
          remainingCount={remainingCount}
        />
      </View>
    </View>
  );

  switch (displayImages.length) {
    case 1:
      return renderSingleImage();
    case 2:
      return renderTwoImages();
    case 3:
      return renderThreeImages();
    default:
      return renderFourOrMoreImages();
  }
};

const RenderFileGrid = ({
  attachments,
  isCurrentUser,
}: {
  attachments: IMessageAttachment[];
  isCurrentUser: boolean;
}) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter((att) => getFileType(att) === "image");
  const documents = attachments.filter((att) => getFileType(att) !== "image");

  if (images.length === 0 && documents.length === 0) return null;

  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setPreviewVisible(true);
  };

  const handleClosePreview = () => {
    setPreviewVisible(false);
  };

  return (
    <>
      <View>
        {documents.map((doc, index) => (
          <View
            key={doc.id || `doc-${index}`}
            style={dynamicStyles.documentSpacing(documents.length > 1, images.length > 0)}
          >
            <DocumentCard attachment={doc} isCurrentUser={isCurrentUser} />
          </View>
        ))}

        {images.length > 0 && (
          <View style={dynamicStyles.container(isCurrentUser)}>
            <ImageGrid images={images} onImagePress={handleImagePress} />
          </View>
        )}
      </View>

      <ImagePreview
        visible={previewVisible}
        images={images}
        initialIndex={selectedImageIndex}
        onClose={handleClosePreview}
      />
    </>
  );
};

export const renderFileGrid = (attachments: IMessageAttachment[], isCurrentUser: boolean) => (
  <RenderFileGrid attachments={attachments} isCurrentUser={isCurrentUser} />
);
