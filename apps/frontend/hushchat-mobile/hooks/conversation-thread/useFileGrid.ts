import { useState, useMemo } from "react";
import { IMessageAttachment } from "@/types/chat/types";
import { getFileType } from "@/utils/files/getFileType";

export const useFileGrid = (attachments: IMessageAttachment[]) => {
  const [previewVisible, setPreviewVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { images, videos, documents, audioItems } = useMemo(() => {
    const imgs = [];
    const vids = [];
    const docs = [];
    const auds = [];

    for (const att of attachments) {
      const fileName = att.originalFileName || att.indexedFileName || "";
      const type = getFileType(fileName);

      if (type === "image") imgs.push(att);
      else if (type === "video") vids.push(att);
      else if (type === "audio") auds.push(att);
      else docs.push(att);
    }

    return { images: imgs, videos: vids, documents: docs, audioItems: auds };
  }, [attachments]);

  const mediaItems = useMemo(() => [...images, ...videos], [images, videos]);
  const openPreview = (index: number) => {
    setSelectedImageIndex(index);
    setPreviewVisible(true);
  };

  const closePreview = () => {
    setPreviewVisible(false);
  };

  return {
    images,
    videos,
    documents,
    audioItems,
    mediaItems,
    previewVisible,
    selectedImageIndex,
    openPreview,
    closePreview,
    hasImages: images.length > 0,
    hasVideos: videos.length > 0,
    hasMedia: mediaItems.length > 0,
    hasDocuments: documents.length > 0,
    hasAudio: audioItems.length > 0,
  };
};
