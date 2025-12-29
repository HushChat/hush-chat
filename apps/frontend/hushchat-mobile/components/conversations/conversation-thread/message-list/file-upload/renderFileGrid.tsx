import { useState } from "react"; // Import useState
import { IMessageAttachment } from "@/types/chat/types";
import { View, ViewStyle } from "react-native";
import { DocumentCard } from "@/components/conversations/conversation-thread/message-list/file-upload/DocumentCard";
import { ImageGrid } from "@/components/conversations/conversation-thread/message-list/file-upload/ImageGrid";
import { useFileGrid } from "@/hooks/conversation-thread/useFileGrid";
import MediaPreview from "@/components/conversations/conversation-thread/composer/image-preview/MediaPreview";
import { DocumentPreview } from "@/components/conversations/conversation-thread/message-list/file-upload/DocumentCard/DocumentPreview";

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
  // 1. Add state for Document Preview
  const [docPreviewVisible, setDocPreviewVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<IMessageAttachment | null>(null);

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

  // 2. Handler to open document preview
  const handleOpenDocPreview = (doc: IMessageAttachment) => {
    setSelectedDoc(doc);
    setDocPreviewVisible(true);
  };

  const handleCloseDocPreview = () => {
    setDocPreviewVisible(false);
    setSelectedDoc(null);
  };

  if (!hasMedia && !hasDocuments) return null;

  return (
    <>
      <View>
        {documents.map((doc, index) => (
          <View
            key={doc.id || `doc-${index}`}
            style={dynamicStyles.documentSpacing(documents.length > 1, hasMedia)}
          >
            {/* 3. Pass the onPreview prop */}
            <DocumentCard
              attachment={doc}
              isCurrentUser={isCurrentUser}
              onPreview={() => handleOpenDocPreview(doc)}
            />
          </View>
        ))}

        {hasMedia && (
          <View style={dynamicStyles.container(isCurrentUser)}>
            <ImageGrid images={mediaItems} onImagePress={openPreview} />
          </View>
        )}
      </View>

      {/* Existing Media Preview (Images/Videos) */}
      <MediaPreview
        visible={previewVisible}
        images={mediaItems}
        initialIndex={selectedImageIndex}
        onClose={closePreview}
      />

      {/* 4. New Document Preview Modal */}
      <DocumentPreview
        visible={docPreviewVisible}
        attachment={selectedDoc}
        onClose={handleCloseDocPreview}
      />
    </>
  );
};

export const renderFileGrid = (attachments: IMessageAttachment[], isCurrentUser: boolean) => (
  <RenderFileGrid attachments={attachments} isCurrentUser={isCurrentUser} />
);
