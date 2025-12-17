import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_FILES, validateFiles } from "@/utils/fileValidation";
import { ToastUtils } from "@/utils/toastUtils";

type Options = {
  maxFiles?: number;
  onError?: (errors: string[]) => void;
};

export function useImagePreview(options: Options = {}) {
  const { maxFiles = MAX_FILES, onError } = options;

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [imageMessage, setImageMessage] = useState("");

  const filesRef = useRef<File[]>([]);
  useEffect(() => {
    filesRef.current = selectedFiles;
  }, [selectedFiles]);

  const reportErrors = useCallback(
    (errs: string[]) => {
      if (!errs.length) return;
      if (onError) onError(errs);
      else ToastUtils.error(errs.join("\n"));
    },
    [onError]
  );

  const open = useCallback(
    (files: File[]) => {
      const { errors, validFiles } = validateFiles(files, 0);
      reportErrors(errors);
      if (validFiles.length > 0) {
        setSelectedFiles(validFiles.slice(0, maxFiles));
        setImageMessage("");
        setShowImagePreview(true);
      }
    },
    [maxFiles, reportErrors]
  );

  const close = useCallback(() => {
    setShowImagePreview(false);
    setSelectedFiles([]);
    setImageMessage("");
  }, []);

  const removeAt = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) {
        setShowImagePreview(false);
        setImageMessage("");
      }
      return next;
    });
  }, []);

  const addMore = useCallback(
    (newFiles: File[]) => {
      const currentCount = filesRef.current.length;
      const { errors, validFiles } = validateFiles(newFiles, currentCount);
      reportErrors(errors);
      if (validFiles.length > 0) {
        setSelectedFiles((prev) => {
          const all = [...prev, ...validFiles];
          return all.slice(0, maxFiles);
        });
      }
    },
    [maxFiles, reportErrors]
  );

  return {
    selectedFiles,
    showImagePreview,
    imageMessage,
    setImageMessage,
    open,
    close,
    removeAt,
    addMore,
  };
}
