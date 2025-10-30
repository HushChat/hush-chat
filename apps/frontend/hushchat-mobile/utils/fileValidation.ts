import { ToastUtils } from "@/utils/toastUtils";

export const MAX_FILES = 10;
export const MAX_FILE_SIZE = 10_000_000; // 10MB
export const ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
];

export const validateFiles = (
  files: FileList | File[],
  currentFileCount: number = 0,
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

    if (file.size > MAX_FILE_SIZE) {
      fileErrors.push(
        `File ${file.name} is too large (max ${MAX_FILE_SIZE / 1_000_000}MB)`,
      );
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(extension || "")) {
      fileErrors.push(
        `File ${file.name} has invalid extension. Only ${ALLOWED_EXTENSIONS.join(", ")} are allowed`,
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
