import { DOC_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "@/constants/mediaConstants";

export type FileType = "image" | "video" | "document" | "unsupported";

export const getFileType = (fileName: string): FileType => {
  const ext = fileName.split(".").pop()?.toLowerCase();

  if (!ext) return "unsupported";

  if (IMAGE_EXTENSIONS.includes(ext)) return "image";
  if (VIDEO_EXTENSIONS.includes(ext)) return "video";
  if (DOC_EXTENSIONS.includes(ext)) return "document";

  return "unsupported";
};
