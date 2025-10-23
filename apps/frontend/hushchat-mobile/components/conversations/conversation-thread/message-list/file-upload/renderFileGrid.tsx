/**
 * renderFileGrid.tsx
 * Updated with image preview functionality
 */

import React, { useState } from 'react';
import { IMessageAttachment } from '@/types/chat/types';
import { TouchableOpacity, View, ViewStyle, ImageStyle, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { AppText } from '@/components/AppText';
import { DEFAULT_ACTIVE_OPACITY } from '@/constants/ui';
// @ts-ignore
// eslint-disable-next-line import/no-unresolved
import { ImagePreview } from '@/components/conversations/conversation-thread/composer/image-preview/ImagePreview';

const GRID_CONFIG = {
  MAX_WIDTH: 280,
  MAX_HEIGHT: 280,
  SINGLE_IMAGE_MAX_HEIGHT: 350,
  IMAGE_GAP: 2,
  BORDER_RADIUS: 8,
  MAX_DISPLAY_IMAGES: 4,
} as const;

const createImageStyle = (width: number, height: number): ImageStyle => ({
  width,
  height,
  borderRadius: GRID_CONFIG.BORDER_RADIUS,
});

const styles = {
  container: (isCurrentUser: boolean): ViewStyle => ({
    maxWidth: GRID_CONFIG.MAX_WIDTH,
    alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
  }),

  gap: {
    gap: GRID_CONFIG.IMAGE_GAP,
  } as ViewStyle,

  singleImageContainer: {
    overflow: 'hidden',
    borderRadius: GRID_CONFIG.BORDER_RADIUS,
  } as ViewStyle,

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
    GRID_CONFIG.MAX_HEIGHT / 1.5,
  ),

  threeImagesLarge: createImageStyle(
    (GRID_CONFIG.MAX_WIDTH - GRID_CONFIG.IMAGE_GAP) / 2,
    GRID_CONFIG.MAX_HEIGHT / 1.3,
  ),

  threeImagesSmall: createImageStyle(
    (GRID_CONFIG.MAX_WIDTH - GRID_CONFIG.IMAGE_GAP) / 2,
    (GRID_CONFIG.MAX_HEIGHT / 1.3 - GRID_CONFIG.IMAGE_GAP) / 2,
  ),

  fourImagesImage: createImageStyle(
    (GRID_CONFIG.MAX_WIDTH - GRID_CONFIG.IMAGE_GAP) / 2,
    (GRID_CONFIG.MAX_HEIGHT - GRID_CONFIG.IMAGE_GAP) / 2,
  ),

  overlayContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: GRID_CONFIG.BORDER_RADIUS,
  } as ViewStyle,
} as const;

const getFileType = (
  attachment: IMessageAttachment,
): 'image' | 'pdf' | 'word' | 'excel' | 'unknown' => {
  const fileName = attachment.originalFileName || attachment.indexedFileName || '';
  const ext = fileName.toLowerCase().split('.').pop();

  if (['jpg', 'jpeg', 'png', 'svg', 'gif', 'webp'].includes(ext || '')) return 'image';
  if (ext === 'pdf') return 'pdf';
  if (['doc', 'docx'].includes(ext || '')) return 'word';
  if (['xls', 'xlsx'].includes(ext || '')) return 'excel';

  return 'unknown';
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
  const isDark = colorScheme === 'dark';

  const fileType = getFileType(attachment);
  const typeLabels: Record<string, { label: string; icon: string; color: string }> = {
    pdf: { label: 'PDF', icon: 'document-text', color: '#6B4EFF' },
    word: { label: 'WORD', icon: 'document-text', color: '#2B6CB0' },
    excel: { label: 'EXCEL', icon: 'document-text', color: '#16A34A' },
    unknown: { label: 'FILE', icon: 'document-text', color: '#6B7280' },
  };

  const { label, icon, color } = typeLabels[fileType] || typeLabels.unknown;
  const bgColor = isDark ? 'rgba(86, 61, 196, 0.25)' : 'rgba(107, 78, 255, 0.15)';
  const borderColor = isDark ? 'rgba(86, 61, 196, 0.4)' : 'rgba(107, 78, 255, 0.3)';
  const textPrimary = isDark ? '#ffffff' : '#111827';
  const textSecondary = isDark ? '#9ca3af' : '#6B7280';

  const handlePress = () => {
    if (attachment.fileUrl) Linking.openURL(attachment.fileUrl);
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={DEFAULT_ACTIVE_OPACITY}
      style={{
        maxWidth: GRID_CONFIG.MAX_WIDTH,
        padding: 12,
        backgroundColor: bgColor,
        borderRadius: GRID_CONFIG.BORDER_RADIUS,
        borderWidth: 1,
        borderColor,
        alignSelf: isCurrentUser ? 'flex-end' : 'flex-start',
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        <View
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 12,
          }}
        >
          <Ionicons name={icon as any} size={20} color={color} />
          <AppText style={{ fontSize: 8, fontWeight: 'bold', marginTop: 2, color }}>
            {label}
          </AppText>
        </View>
        <View style={{ flex: 1, minWidth: 0 }}>
          <AppText
            numberOfLines={2}
            style={{ fontSize: 12, fontWeight: '600', color: textPrimary }}
          >
            {attachment.originalFileName || 'Document'}
          </AppText>
          <AppText style={{ fontSize: 10, marginTop: 2, color: textSecondary }}>
            {label} Document
          </AppText>
        </View>
        <View style={{ marginLeft: 8 }}>
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
    style={{ position: 'relative' }}
  >
    <Image
      source={{ uri: attachment.fileUrl }}
      style={style}
      contentFit="cover"
      cachePolicy="memory-disk"
    />
    {showOverlay && remainingCount > 0 && (
      <View style={styles.overlayContainer}>
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
    <View style={styles.singleImageContainer}>
      <ImageItem
        attachment={displayImages[0]}
        style={styles.singleImage(aspectRatio)}
        onPress={() => onImagePress(0)}
      />
    </View>
  );

  const renderTwoImages = () => (
    <View className="flex-row" style={styles.gap}>
      <ImageItem
        attachment={displayImages[0]}
        style={styles.twoImagesImage}
        onPress={() => onImagePress(0)}
      />
      <ImageItem
        attachment={displayImages[1]}
        style={styles.twoImagesImage}
        onPress={() => onImagePress(1)}
      />
    </View>
  );

  const renderThreeImages = () => (
    <View className="flex-row" style={styles.gap}>
      <ImageItem
        attachment={displayImages[0]}
        style={styles.threeImagesLarge}
        onPress={() => onImagePress(0)}
      />
      <View style={styles.gap}>
        <ImageItem
          attachment={displayImages[1]}
          style={styles.threeImagesSmall}
          onPress={() => onImagePress(1)}
        />
        <ImageItem
          attachment={displayImages[2]}
          style={styles.threeImagesSmall}
          onPress={() => onImagePress(2)}
        />
      </View>
    </View>
  );

  const renderFourOrMoreImages = () => (
    <View className="flex-row" style={styles.gap}>
      <View style={styles.gap}>
        <ImageItem
          attachment={displayImages[0]}
          style={styles.fourImagesImage}
          onPress={() => onImagePress(0)}
        />
        <ImageItem
          attachment={displayImages[1]}
          style={styles.fourImagesImage}
          onPress={() => onImagePress(1)}
        />
      </View>
      <View style={styles.gap}>
        <ImageItem
          attachment={displayImages[2]}
          style={styles.fourImagesImage}
          onPress={() => onImagePress(2)}
        />
        <ImageItem
          attachment={displayImages[3]}
          style={styles.fourImagesImage}
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

  const images = attachments.filter((att) => getFileType(att) === 'image');
  const documents = attachments.filter((att) => getFileType(att) !== 'image');

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
            style={{ marginBottom: documents.length > 1 || images.length > 0 ? 8 : 0 }}
          >
            <DocumentCard attachment={doc} isCurrentUser={isCurrentUser} />
          </View>
        ))}

        {images.length > 0 && (
          <View style={styles.container(isCurrentUser)}>
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
