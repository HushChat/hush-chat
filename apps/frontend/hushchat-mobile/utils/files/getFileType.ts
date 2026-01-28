import { AUDIO_EXTENSIONS, IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "@/constants/mediaConstants";

export type FileType = "image" | "video" | "audio" | "document";

/**
 * Determines file type based on file extension.
 * Defaults to "document" for any unknown or missing extension.
 * * @param fileName - The file name (e.g., "photo.jpg", "archive.jar")
 * @returns FileType - "image", "video", or "document"
 */
export const getFileType = (fileName: string): FileType => {
  if (!fileName) return "document";

  const ext = fileName.split(".").pop()?.toLowerCase();

  if (!ext) return "document";

  if (IMAGE_EXTENSIONS.includes(ext)) {
    return "image";
  }

  if (VIDEO_EXTENSIONS.includes(ext)) {
    return "video";
  }

  if (AUDIO_EXTENSIONS.includes(ext)) {
    return "audio";
  }

  return "document";
};
