import {
  DOC_EXTENSIONS,
  IMAGE_EXTENSIONS,
  VIDEO_EXTENSIONS,
  MAX_IMAGE_SIZE_KB,
  MAX_VIDEO_SIZE_KB,
  MAX_DOCUMENT_SIZE_KB,
} from "@/constants/mediaConstants";
import { ToastUtils } from "@/utils/toastUtils";
import { getFileType } from "@/utils/files/getFileType";

export const MAX_FILES = 10;
export const ALLOWED_EXTENSIONS = [...IMAGE_EXTENSIONS, ...VIDEO_EXTENSIONS, ...DOC_EXTENSIONS];

const formatFileSize = (sizeKB: number) =>
  sizeKB >= 1024 ? `${(sizeKB / 1024).toFixed(2)} MB` : `${sizeKB.toFixed(2)} KB`;

export const validateFiles = (
  files: FileList | File[],
  currentFileCount: number = 0
): { errors: string[]; validFiles: File[] } => {
  const errors: string[] = [];
  const validFiles: File[] = [];
  const fileArray = Array.from(files);

  if (currentFileCount + fileArray.length > MAX_FILES) {
    const msg = `You can only attach up to ${MAX_FILES} files in total`;
    ToastUtils.error(msg);
    return { errors: [msg], validFiles };
  }

  fileArray.forEach((file) => {
    const fileErrors: string[] = [];
    const extension = file.name.split(".").pop()?.toLowerCase() || "";
    const fileType = getFileType(file.name);
    const sizeKB = file.size / 1024;

    if (fileType === "unsupported" || !ALLOWED_EXTENSIONS.includes(extension)) {
      fileErrors.push(
        `"${file.name}" is not supported. Allowed: images (${IMAGE_EXTENSIONS.join(
          ", "
        )}), videos (${VIDEO_EXTENSIONS.join(", ")}), documents (${DOC_EXTENSIONS.join(", ")})`
      );
      errors.push(...fileErrors);
      return;
    }

    let maxSize: number;

    switch (fileType) {
      case "image":
        maxSize = MAX_IMAGE_SIZE_KB;
        break;
      case "video":
        maxSize = MAX_VIDEO_SIZE_KB;
        break;
      case "document":
        maxSize = MAX_DOCUMENT_SIZE_KB;
        break;
    }

    if (sizeKB > maxSize) {
      fileErrors.push(
        `"${file.name}" is too large. Max allowed: ${formatFileSize(
          maxSize
        )}, current: ${formatFileSize(sizeKB)}`
      );
    }

    if (fileErrors.length === 0) {
      validFiles.push(file);
    } else {
      errors.push(...fileErrors);
    }
  });

  errors.forEach((error) => ToastUtils.error(error));

  return { errors, validFiles };
};
