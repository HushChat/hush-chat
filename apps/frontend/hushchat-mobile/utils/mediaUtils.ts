import { IMessageAttachment } from "@/types/chat/types";
import { getFileType } from "@/utils/files/getFileType";

export const THUMBNAIL = {
  SIZE_NATIVE: 60,
  SIZE_WEB: 80,
  GAP: 8,
  VISIBLE_COUNT: 6,
  BORDER_WIDTH: 2,
  ACTIVE_BORDER_WIDTH: 4,
} as const;

export const getAttachmentFileName = (attachment: IMessageAttachment | undefined): string => {
  return attachment?.originalFileName || attachment?.indexedFileName || "";
};

export const isAttachmentVideo = (attachment: IMessageAttachment | undefined): boolean => {
  const fileName = getAttachmentFileName(attachment);
  return getFileType(fileName) === "video";
};

export const getThumbnailDisplayUri = (
  attachment: IMessageAttachment,
  thumbnailUri: string | undefined
): string => {
  const isVideo = isAttachmentVideo(attachment);
  return isVideo && thumbnailUri ? thumbnailUri : attachment.fileUrl || "";
};

export const calculateThumbnailScrollOffset = (
  index: number,
  thumbnailSize: number = THUMBNAIL.SIZE_WEB
): number => {
  const itemWidth = thumbnailSize + THUMBNAIL.GAP;
  return Math.max(0, index * itemWidth - itemWidth);
};
