import { useState } from "react";
import {
  LocalFile,
  SignedUrl,
  useNativePickerUpload,
  PickAndUploadOptions,
} from "@/hooks/useNativePickerUpload";
import { getContactUsSignedUrls } from "@/apis/conversation";

const MAX_IMAGE_KB = 1024 * 5;
const MAX_DOCUMENT_KB = 1024 * 10;

export interface UIFileState {
  localFile: LocalFile;
  success: boolean;
  error?: string;
  indexedFileName?: string;
  originalFileName?: string;
  isUploading: boolean;
}

export function useContactUsUploader() {
  const [uploads, setUploads] = useState<UIFileState[]>([]);

  const getSignedUrls = async (files: LocalFile[]): Promise<SignedUrl[] | null> => {
    const fileNames = files.map((file) => file.name);
    const response = await getContactUsSignedUrls(fileNames);

    return (response?.signedURLs || []).map((s: any) => ({
      originalFileName: s.originalFileName,
      url: s.url,
      indexedFileName: s.indexedFileName,
    }));
  };

  const {
    pick,
    upload,
    isUploading: isNativeUploading,
    reset: nativeReset,
  } = useNativePickerUpload(getSignedUrls);

  const handlePickAndUpload = async (opts: Partial<PickAndUploadOptions>) => {
    const pickedFiles = await pick(opts);
    if (!pickedFiles || pickedFiles.length === 0) return;

    const newEntries: UIFileState[] = pickedFiles.map((f) => ({
      localFile: f,
      success: false,
      isUploading: true,
    }));

    setUploads((prev) => [...prev, ...newEntries]);

    const results = await upload(pickedFiles);
    setUploads((prev) => {
      return prev.map((item) => {
        const res = results.find((r) => r.fileName === item.localFile.name);

        if (item.isUploading && res) {
          return {
            ...item,
            isUploading: false,
            success: res.success,
            error: res.error,
            indexedFileName: res.signed?.indexedFileName,
            originalFileName: res.signed?.originalFileName,
          };
        }
        return item;
      });
    });
  };

  const pickAndUploadImages = () =>
    handlePickAndUpload({
      source: "media",
      mediaKind: "image",
      multiple: true,
      maxSizeKB: MAX_IMAGE_KB,
      allowedMimeTypes: ["image/*"],
      allowsEditing: false,
    });

  const pickAndUploadDocuments = () =>
    handlePickAndUpload({
      source: "document",
      multiple: true,
      maxSizeKB: MAX_DOCUMENT_KB,
      allowedMimeTypes: [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "text/plain",
      ],
    });

  const removeFile = (uri: string) => {
    setUploads((prev) => prev.filter((item) => item.localFile.uri !== uri));
  };

  const resetUploads = () => {
    setUploads([]);
    nativeReset();
  };

  return {
    isUploading: isNativeUploading,
    uploads,
    pickAndUploadImages,
    pickAndUploadDocuments,
    removeFile,
    resetUploads,
  };
}
