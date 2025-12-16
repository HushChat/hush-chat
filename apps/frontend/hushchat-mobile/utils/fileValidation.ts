import { ToastUtils } from "@/utils/toastUtils";

export const MAX_FILES = 10;
export const MAX_IMAGE_SIZE = 5_000_000;
export const MAX_DOCUMENT_SIZE = 10_000_000;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp",
];

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
];

const getFileCategory = (file: File): "image" | "document" | "invalid" => {
  const type = file.type || "";

  if (ALLOWED_IMAGE_TYPES.includes(type) || type.startsWith("image/")) {
    return "image";
  }

  if (ALLOWED_DOCUMENT_TYPES.includes(type)) {
    return "document";
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (extension) {
    const docExtensions = ["pdf", "doc", "docx", "xls", "xlsx", "txt"];

    if (docExtensions.includes(extension)) {
      return "document";
    }
  }
  return "invalid";
};

export const validateFiles = (
  files: FileList | File[],
  currentFileCount: number = 0
): { errors: string[]; validFiles: File[] } => {
  const errors: string[] = [];
  const validFiles: File[] = [];
  const fileArray = Array.from(files);

  if (currentFileCount + fileArray.length > MAX_FILES) {
    errors.push(`You can only attach up to ${MAX_FILES} files in total`);
    return { errors, validFiles };
  }

  fileArray.forEach((file) => {
    const fileErrors: string[] = [];
    const category = getFileCategory(file);

    if (category === "invalid") {
      fileErrors.push(`File ${file.name} has an unsupported type.`);
    } else {
      const maxSize = category === "image" ? MAX_IMAGE_SIZE : MAX_DOCUMENT_SIZE;

      if (file.size > maxSize) {
        fileErrors.push(
          `File ${file.name} is too large (max ${maxSize / 1_000_000}MB for ${category}s)`
        );
      }
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
