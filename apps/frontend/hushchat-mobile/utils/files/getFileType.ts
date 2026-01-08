export type FileType = "image" | "video" | "document";

/**
 * Determines file type based on MIME type (primary) or file extension (fallback)
 * @param mimeType - The MIME type of the file (e.g., "image/jpeg")
 * @param fileName - The file name with extension (used as fallback)
 * @returns FileType - "image", "video", or "document"
 */
export const getFileType = (mimeType?: string, fileName?: string): FileType => {
  if (mimeType) {
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType.startsWith("video/")) return "video";
    return "document";
  }

  if (fileName) {
    const ext = fileName.split(".").pop()?.toLowerCase();
    if (!ext) return "document";

    if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico", "heic", "heif"].includes(ext)) {
      return "image";
    }

    if (
      ["mp4", "mov", "webm", "avi", "mkv", "m4v", "mpeg", "3gpp", "flv", "wmv", "ogv"].includes(ext)
    ) {
      return "video";
    }
  }
  return "document";
};
