import { IMessageAttachment } from "@/types/chat/types";
import { View, ViewStyle } from "react-native";
import { DocumentCard } from "@/components/conversations/conversation-thread/message-list/file-upload/DocumentCard";
import { ImageGrid } from "@/components/conversations/conversation-thread/message-list/file-upload/ImageGrid";
import { useFileGrid } from "@/hooks/conversation-thread/useFileGrid";
import MediaPreview from "@/components/conversations/conversation-thread/composer/image-preview/MediaPreview";

const GRID_CONFIG = {
  MAX_WIDTH: 280,
} as const;

const dynamicStyles = {
  container: (isCurrentUser: boolean): ViewStyle => ({
    maxWidth: GRID_CONFIG.MAX_WIDTH,
    alignSelf: isCurrentUser ? "flex-end" : "flex-start",
  }),

  documentSpacing: (hasMultipleDocs: boolean, hasMedia: boolean): ViewStyle => ({
    marginBottom: hasMultipleDocs || hasMedia ? 8 : 0,
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
    mediaItems,
    documents,
    previewVisible,
    selectedImageIndex,
    openPreview,
    closePreview,
    hasMedia,
    hasDocuments,
  } = useFileGrid(attachments);

  if (!hasMedia && !hasDocuments) return null;

  return (
    <>
      <View>
        {documents.map((doc, index) => (
          <View
            key={doc.id || `doc-${index}`}
            style={dynamicStyles.documentSpacing(documents.length > 1, hasMedia)}
          >
            <DocumentCard attachment={doc} isCurrentUser={isCurrentUser} />
          </View>
        ))}

        {hasMedia && (
          <View style={dynamicStyles.container(isCurrentUser)}>
            <ImageGrid images={mediaItems} onImagePress={openPreview} />
          </View>
        )}
      </View>

      <MediaPreview
        visible={previewVisible}
        images={mediaItems}
        initialIndex={selectedImageIndex}
        onClose={closePreview}
      />
    </>
  );
};

export const renderFileGrid = (attachments: IMessageAttachment[], isCurrentUser: boolean) => (
  <RenderFileGrid attachments={attachments} isCurrentUser={isCurrentUser} />
);
