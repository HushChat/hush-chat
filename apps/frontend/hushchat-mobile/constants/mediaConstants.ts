export const ACCEPT_IMAGE_TYPES = ["image/*"].join(",");
export const ACCEPT_DOC_TYPES = [
  ".pdf",
  "application/pdf",
  ".doc",
  ".docx",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls",
  ".xlsx",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
].join(",");

export const ACCEPT_FILE_TYPES = [ACCEPT_IMAGE_TYPES, ACCEPT_DOC_TYPES].join(",");

export const MAX_IMAGE_SIZE_KB = 5 * 1024; // 5MB
export const MAX_VIDEO_SIZE_KB = 50 * 1024; // 50MB
export const MAX_DOCUMENT_SIZE_KB = 25 * 1024; // 25MB
export const SIZES = ["Bytes", "KB", "MB"];

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", "gif", "webp", "svg"];

export const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "avi", "mkv", "m4v", "mpeg", "3gpp"];

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
  ...ARCHIVE_EXTENSIONS,
];
