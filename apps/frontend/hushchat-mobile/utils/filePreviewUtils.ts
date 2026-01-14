import { PLATFORM } from "@/constants/platformConstants";
import { IMAGE_EXTENSIONS, VIDEO_EXTENSIONS } from "@/constants/mediaConstants";

const normalize = (exts: string[]) => exts.map((e) => e.replace(".", "").toLowerCase());

const IMAGES = normalize(IMAGE_EXTENSIONS);
const VIDEOS = normalize(VIDEO_EXTENSIONS);

const VIEWER_CONFIG = {
  OFFICE: ["doc", "docx", "xls", "xlsx", "ppt", "pptx"],
  PDF: ["pdf"],

  TEXT_NATIVE: ["txt", "json", "xml", "csv", "log", "tsx", "ts", "js", "jsx", "html", "css"],

  WEB_NATIVE: [
    ...IMAGES,
    ...VIDEOS,
    "pdf",
    "txt",
    "json",
    "xml",
    "csv",
    "log",
    "tsx",
    "ts",
    "js",
    "jsx",
  ],
};

export const getFileExtension = (fileName: string): string => {
  return fileName?.split(".").pop()?.toLowerCase() || "";
};

/**
 * Checks if a LOCAL file (Blob) can be previewed in an iframe/img/video tag.
 * Used by FilePreviewPane.
 */
export const isLocalPreviewSupported = (fileName: string) => {
  const ext = getFileExtension(fileName);

  const isOffice = VIEWER_CONFIG.OFFICE.includes(ext);
  const isPdf = VIEWER_CONFIG.PDF.includes(ext);
  const isText = VIEWER_CONFIG.TEXT_NATIVE.includes(ext);

  return (isPdf || isText) && !isOffice;
};

export const getDocumentViewerUrl = (fileUrl: string, fileName: string): string => {
  if (!fileUrl) return "";

  const encodedUrl = encodeURIComponent(fileUrl);
  const ext = getFileExtension(fileName);

  if (VIEWER_CONFIG.OFFICE.includes(ext)) {
    return `https://view.officeapps.live.com/op/embed.aspx?src=${encodedUrl}`;
  }

  if (VIEWER_CONFIG.PDF.includes(ext)) {
    if (PLATFORM.IS_ANDROID) {
      return `https://docs.google.com/gview?embedded=true&url=${encodedUrl}`;
    }
    if (PLATFORM.IS_WEB) {
      return `${fileUrl}#toolbar=0&navpanes=0`;
    }
    return fileUrl;
  }

  if (PLATFORM.IS_WEB) {
    if (VIEWER_CONFIG.WEB_NATIVE.includes(ext)) {
      return fileUrl;
    }

    return `https://docs.google.com/gview?embedded=true&url=${encodedUrl}`;
  }
  return fileUrl;
};
