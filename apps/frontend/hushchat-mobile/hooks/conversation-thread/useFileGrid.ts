import { useState, useMemo } from "react";
import { IMessageAttachment } from "@/types/chat/types";
import { getFileType } from "@/utils/files/getFileType";

export const useFileGrid = (attachments: IMessageAttachment[]) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { images, documents } = useMemo(() => {
    const imgs = [];
    const docs = [];

    for (const att of attachments) {
      const type = getFileType(att.originalFileName || att.indexedFileName);
      if (type === "image") imgs.push(att);
      else docs.push(att);
    }

    return { images: imgs, documents: docs };
  }, [attachments]);

  const openPreview = (index: number) => {
    setSelectedImageIndex(index);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
  };

  return {
    images,
    documents,
    previewVisible,
    selectedImageIndex,
    openPreview,
    closePreview,
    hasImages: images.length > 0,
    hasDocuments: documents.length > 0,
  };
};
