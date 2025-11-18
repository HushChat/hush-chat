/**
 * renderFileGrid.tsx
 * Updated with image preview functionality
 */

import React, { useState } from "react";
import { IMessageAttachment } from "@/types/chat/types";
import { View, ViewStyle } from "react-native";
import { ImagePreview } from "@/components/conversations/conversation-thread/composer/image-preview/ImagePreview";
import { getFileType } from "@/utils/files/getFileType";
import { DocumentCard } from "./DocumentCard";
import { ImageGrid } from "./ImageGrid";

const GRID_CONFIG = {
  MAX_WIDTH: 280,
  MAX_HEIGHT: 280,
  SINGLE_IMAGE_MAX_HEIGHT: 350,
  IMAGE_GAP: 2,
  BORDER_RADIUS: 8,
  MAX_DISPLAY_IMAGES: 4,
} as const;

const dynamicStyles = {
  container: (isCurrentUser: boolean): ViewStyle => ({
    maxWidth: GRID_CONFIG.MAX_WIDTH,
    alignSelf: isCurrentUser ? "flex-end" : "flex-start",
  }),

  documentSpacing: (hasMultipleDocs: boolean, hasImages: boolean): ViewStyle => ({
    marginBottom: hasMultipleDocs || hasImages ? 8 : 0,
  }),
} as const;

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

  const images = attachments.filter(
    (att) => getFileType(att.originalFileName || att.indexedFileName) === "image"
  );
  const documents = attachments.filter(
    (att) => getFileType(att.originalFileName || att.indexedFileName) !== "image"
  );

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
