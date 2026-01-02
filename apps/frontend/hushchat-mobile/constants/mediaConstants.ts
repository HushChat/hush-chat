// mediaConstants.ts - Just add archive extensions to your existing file

export const MAX_IMAGE_SIZE_KB = 5 * 1024; // 5MB
export const MAX_VIDEO_SIZE_KB = 50 * 1024; // 50MB
export const MAX_DOCUMENT_SIZE_KB = 25 * 1024; // 25MB
export const SIZES = ["Bytes", "KB", "MB"];

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

export const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "avi", "mkv", "m4v", "mpeg", "3gpp"];

// Add archive extensions to your existing DOC_EXTENSIONS
export const ARCHIVE_EXTENSIONS = ["zip", "rar", "7z", "tar", "gz", "tgz"];

export const DOC_EXTENSIONS = [
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
  "txt",
  "csv",
  "rtf",
  "odt",
  "ods",
  "odp",
  "json",
  "xml",
  "html",
  "md",
  ...ARCHIVE_EXTENSIONS, // Add archives here
];
