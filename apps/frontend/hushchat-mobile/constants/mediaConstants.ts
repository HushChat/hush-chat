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

export const IMAGE_EXTENSIONS = ["jpg", "jpeg", "png", ".svg"];

export const DOC_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "tsx"];

export const VIDEO_EXTENSIONS = ["mp4", "mov", "webm", "avi", "mkv"];

export const SIZES = ["Bytes", "KB", "MB"];

export const MAX_IMAGE_SIZE_KB = 1024 * 5; // 5 MB
export const MAX_VIDEO_SIZE_KB = 1024 * 50; // 50 MB
export const MAX_DOCUMENT_SIZE_KB = 1024 * 10; // 10 MB
