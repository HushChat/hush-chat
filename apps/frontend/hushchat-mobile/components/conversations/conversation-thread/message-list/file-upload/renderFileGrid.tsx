/**
 * renderFileGrid.tsx
 * Updated with image preview functionality
 */

import { IMessageAttachment } from "@/types/chat/types";
import { View, ViewStyle } from "react-native";
import { ImagePreview } from "@/components/conversations/conversation-thread/composer/image-preview/ImagePreview";
import { DocumentCard } from "@/components/conversations/conversation-thread/message-list/file-upload/DocumentCard";
import { ImageGrid } from "@/components/conversations/conversation-thread/message-list/file-upload/ImageGrid";
import { useFileGrid } from "@/hooks/conversation-thread/useFileGrid";

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
  const {
    images,
    documents,
    previewVisible,
    selectedImageIndex,
    openPreview,
    closePreview,
    hasImages,
    hasDocuments,
  } = useFileGrid(attachments);

  if (!hasImages && !hasDocuments) return null;

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
            <ImageGrid images={images} onImagePress={openPreview} />
          </View>
        )}
      </View>

      <ImagePreview
        visible={previewVisible}
        images={images}
        initialIndex={selectedImageIndex}
        onClose={closePreview}
      />
    </>
  );
};

export const renderFileGrid = (attachments: IMessageAttachment[], isCurrentUser: boolean) => (
  <RenderFileGrid attachments={attachments} isCurrentUser={isCurrentUser} />
);
