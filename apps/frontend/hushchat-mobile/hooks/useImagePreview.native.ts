import { useCallback, useState } from "react";
import { ToastUtils } from "@/utils/toastUtils";
import { LocalFile } from "@/hooks/useNativePickerUpload";
import { MAX_FILES } from "@/utils/fileValidation";

// Simple validation for native files (mainly count check)
const validateNativeFiles = (files: LocalFile[], currentCount: number) => {
  const validFiles: LocalFile[] = [];
  const errors: string[] = [];

  if (currentCount + files.length > MAX_FILES) {
    errors.push(`Maximum ${MAX_FILES} files allowed.`);
    // You could truncate here if desired, but blocking is safer for UX
    return { validFiles, errors };
  }

  return { validFiles: files, errors };
};

export function useImagePreview() {
  const [selectedFiles, setSelectedFiles] = useState<LocalFile[]>([]);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const open = useCallback((files: LocalFile[]) => {
    const { errors, validFiles } = validateNativeFiles(files, 0);

    if (errors.length > 0) {
      ToastUtils.error(errors.join("\n"));
    }

    if (validFiles.length > 0) {
      setSelectedFiles(validFiles);
      setShowImagePreview(true);
    }
  }, []);

  const close = useCallback(() => {
    setShowImagePreview(false);
    setSelectedFiles([]);
  }, []);

  const removeAt = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setShowImagePreview(false);
      }
      return next;
    });
  }, []);

  const addMore = useCallback((newFiles: LocalFile[]) => {
    setSelectedFiles((prev) => {
      const { errors, validFiles } = validateNativeFiles(newFiles, prev.length);
      if (errors.length > 0) ToastUtils.error(errors.join("\n"));
      return [...prev, ...validFiles];
    });
  }, []);

  return {
    selectedFiles,
    showImagePreview,
    open,
    close,
    removeAt,
    addMore,
  };
}
