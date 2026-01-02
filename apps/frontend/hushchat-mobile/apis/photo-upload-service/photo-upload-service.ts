import * as ImagePicker from "expo-image-picker";
import axios, { AxiosError } from "axios";
import { CONVERSATION_API_ENDPOINTS, USER_API_ENDPOINTS } from "@/constants/apiConstants";
import { ErrorResponse } from "@/utils/apiErrorUtils";
import { ToastUtils } from "@/utils/toastUtils";
import { ImagePickerResult } from "expo-image-picker/src/ImagePicker.types";
import {
  LocalFile,
  SignedUrl,
  UploadResult,
  useNativePickerUpload,
} from "@/hooks/useNativePickerUpload";
import { createMessagesWithAttachments } from "@/apis/conversation";
import { logWarn } from "@/utils/logger";
import { TFileWithCaption } from "@/hooks/conversation-thread/useSendMessageHandler";
import { useState } from "react";
import {
  MAX_DOCUMENT_SIZE_KB,
  MAX_IMAGE_SIZE_KB,
  MAX_VIDEO_SIZE_KB,
} from "@/constants/mediaConstants";
import { IMessage } from "@/types/chat/types";

export enum UploadType {
  PROFILE = "profile",
  GROUP = "group",
}

export const MAX_IMAGE_KB = 1024 * 5;

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/csv",
  "text/html",
  "text/xml",
  "application/xml",
  "text/markdown",
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/x-tar",
  "application/gzip",
  "application/json",
  "application/javascript",
  "text/javascript",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",

  "application/octet-stream",
  "*/*",
];

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];

const ALLOWED_VIDEO_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/x-matroska",
  "video/x-m4v",
];

const ARCHIVE_TYPES = [
  "application/zip",
  "application/x-zip-compressed",
  "application/x-rar-compressed",
  "application/x-7z-compressed",
  "application/x-tar",
  "application/gzip",
  "application/x-compressed",
];

const sizeMap = {
  image: MAX_IMAGE_SIZE_KB,
  video: MAX_VIDEO_SIZE_KB,
  document: MAX_DOCUMENT_SIZE_KB,
};

export type TAttachmentUploadRequest = {
  messageText: string;
  fileName?: string;
  parentMessageId?: number | null;
  gifUrl?: string;
};

interface IMessageWithSignedUrl {
  id: number;
  signedUrl: {
    originalFileName: string;
    indexedFileName: string;
    url: string;
    filePath?: string | null;
  } | null;
}

const extractSignedUrls = (response: IMessageWithSignedUrl[] | any): SignedUrl[] => {
  if (Array.isArray(response)) {
    return response
      .filter((item) => item.signedUrl && item.signedUrl.url)
      .map((item) => ({
        originalFileName: item.signedUrl.originalFileName,
        url: item.signedUrl.url,
        indexedFileName: item.signedUrl.indexedFileName,
      }));
  }
  return [];
};

const getFileCategory = (mimeType: string): "image" | "video" | "document" => {
  if (ALLOWED_IMAGE_TYPES.some((type) => mimeType === type || mimeType.startsWith("image/"))) {
    return "image";
  }
  if (ALLOWED_VIDEO_TYPES.some((type) => mimeType === type || mimeType.startsWith("video/"))) {
    return "video";
  }
  return "document";
};

const getFileExtension = (fileName: string): string => {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
};

const isValidFileType = (mimeType: string, fileName: string): boolean => {
  if (ALLOWED_DOCUMENT_TYPES.includes(mimeType)) {
    return true;
  }

  if (ALLOWED_IMAGE_TYPES.some((type) => mimeType === type || mimeType.startsWith("image/"))) {
    return true;
  }
  if (ALLOWED_VIDEO_TYPES.some((type) => mimeType === type || mimeType.startsWith("video/"))) {
    return true;
  }

  const ext = getFileExtension(fileName);
  const archiveExtensions = ["zip", "rar", "7z", "tar", "gz", "tgz"];
  if (archiveExtensions.includes(ext)) {
    return true;
  }

  if (ARCHIVE_TYPES.includes(mimeType)) {
    return true;
  }

  return false;
};

export const pickAndUploadImage = async (
  id: string,
  fetchData: () => void,
  setUploading: (v: boolean) => void,
  uploadType: UploadType
) => {
  const getSignedUrlAndInfo = async (fileName: string, fileType: string) => {
    const { data, error } = await getImageSignedUrl(id, fileName, fileType, uploadType);
    if (error) throw new Error(error);
    return data;
  };

  try {
    const pickerResult = await uploadImage();
    if (!pickerResult) {
      return;
    }

    const asset =
      pickerResult.assets && pickerResult.assets.length > 0 ? pickerResult.assets[0] : null;
    if (!asset) return;

    const response = await fetch(asset.uri);
    const blob = await response.blob();
    const fileSizeInKB = blob.size / 1024;

    if (fileSizeInKB > MAX_IMAGE_SIZE_KB) {
      ToastUtils.error("Select an image size below 5MB");
      return;
    }

    const imageAssetData = getImagePickerAsset(pickerResult, uploadType);
    if (!imageAssetData) return;

    const { fileUri, fileName, fileType } = imageAssetData;

    const uploadInfo = await getSignedUrlAndInfo(fileName, fileType);
    const { url: signedUrl, indexedFileName, originalFileName } = uploadInfo;
    const uploadedImageUrl = signedUrl;

    await uploadImageToSignedUrl(fileUri, signedUrl);

    fetchData();

    return { uploadedImageUrl, indexedFileName, originalFileName, pickerResult };
  } catch {
    return;
  } finally {
    setUploading(false);
  }
};

export const uploadImageToSignedUrl = async (fileUri: string, signedUrl: string) => {
  const blob = await (await fetch(fileUri)).blob();
  await fetch(signedUrl, {
    method: "PUT",
    body: blob,
    headers: {
      "Content-Type": blob.type,
    },
  });
};

export const getImageSignedUrl = async (
  id: string,
  fileName: string,
  fileType: string,
  uploadType: UploadType
) => {
  try {
    const endpoint =
      uploadType === UploadType.GROUP
        ? CONVERSATION_API_ENDPOINTS.GROUP_IMAGE_SIGNED_URL(id)
        : USER_API_ENDPOINTS.PROFILE_IMAGE_SIGNED_URL(id);
    const response = await axios.post(endpoint, {
      fileNames: [fileName],
      fileType,
    });
    const data = Array.isArray(response.data) ? response.data[0] : response.data;
    return { data };
  } catch (error: unknown) {
    const axiosError = error as AxiosError<ErrorResponse>;
    return { error: axiosError.response?.data?.error || axiosError.message };
  }
};

export const uploadImage = async (): Promise<ImagePickerResult | undefined> => {
  const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permissionResult.granted) {
    alert("Permission to access media library is required!");
    return;
  }

  const pickerResult = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 0.8,
  });

  return pickerResult;
};

export const getImagePickerAsset = (pickerResult: ImagePickerResult, uploadType: UploadType) => {
  const asset =
    pickerResult?.assets && pickerResult?.assets.length > 0 ? pickerResult.assets[0] : null;
  if (!asset) {
    return;
  }

  const defaultFileName = uploadType === UploadType.GROUP ? "group.jpg" : "profile.jpg";
  const fileUri = asset.uri;
  const fileName = fileUri ? fileUri.split("/").pop() || defaultFileName : defaultFileName;
  const fileType = asset.type || "image";

  return { fileUri, fileName, fileType };
};

type UploadCompletionCallback = (results: UploadResult[]) => void | Promise<void>;

export function useMessageAttachmentUploader(
  conversationId: number,
  onUploadComplete?: UploadCompletionCallback
) {
  const [isUploadingWebFiles, setIsUploadingWebFiles] = useState(false);
  const getSignedUrls = async (
    files: LocalFile[],
    messageText: string = "",
    parentMessageId?: number | null
  ): Promise<SignedUrl[] | null> => {
    const attachments: TAttachmentUploadRequest[] = files.map((file) => ({
      messageText,
      fileName: file.name,
      parentMessageId,
    }));

    const response = await createMessagesWithAttachments(conversationId, attachments);
    return extractSignedUrls(response);
  };

  const getSignedUrlsWithCaptions = async (
    filesWithCaptions: { file: LocalFile; caption: string }[],
    parentMessageId?: number | null
  ): Promise<SignedUrl[] | null> => {
    const attachments: TAttachmentUploadRequest[] = filesWithCaptions.map(({ file, caption }) => ({
      messageText: caption,
      fileName: file.name,
      parentMessageId,
    }));

    const response = await createMessagesWithAttachments(conversationId, attachments);
    return extractSignedUrls(response);
  };

  const sendGifMessage = async (
    gifUrl: string,
    messageText: string = "",
    parentMessageId?: number | null
  ): Promise<IMessage> => {
    const attachments: TAttachmentUploadRequest[] = [
      {
        messageText,
        gifUrl,
        parentMessageId,
      },
    ];

    const response = await createMessagesWithAttachments(conversationId, attachments);
    return response;
  };

  const hook = useNativePickerUpload(getSignedUrls);

  const pickAndUploadImagesAndVideos = async (messageText: string = "") => {
    const results = await hook.pickAndUpload(
      {
        source: "media",
        mediaKind: "all",
        multiple: true,
        maxSizeKB: MAX_VIDEO_SIZE_KB,
        allowedMimeTypes: ["image/*", "video/*"],
        allowsEditing: false,
      },
      messageText
    );

    if (results && onUploadComplete) {
      await onUploadComplete(results);
    }

    return results;
  };

  const pickAndUploadDocuments = async (messageText: string = "") => {
    const results = await hook.pickAndUpload(
      {
        source: "document",
        multiple: true,
        maxSizeKB: MAX_DOCUMENT_SIZE_KB,
        allowedMimeTypes: ALLOWED_DOCUMENT_TYPES,
      },
      messageText
    );

    if (results && onUploadComplete) {
      await onUploadComplete(results);
    }

    return results;
  };

  const uploadFilesFromWebWithCaptions = async (
    filesWithCaptions: TFileWithCaption[],
    parentMessageId?: number | null
  ): Promise<UploadResult[]> => {
    if (!filesWithCaptions || filesWithCaptions.length === 0) return [];

    setIsUploadingWebFiles(true);

    const toLocal = (f: File): LocalFile & { _blobUrl: string } => ({
      uri: URL.createObjectURL(f),
      name: f.name,
      type: f.type || "application/octet-stream",
      size: f.size,
      _blobUrl: "",
    });

    const validFiles: { file: LocalFile & { _blobUrl: string }; caption: string }[] = [];
    const skipped: UploadResult[] = [];

    for (const { file, caption } of filesWithCaptions) {
      const fileType = file.type || "";
      const fileName = file.name || "";

      if (!isValidFileType(fileType, fileName)) {
        skipped.push({
          success: false,
          fileName: file.name,
          error: `Unsupported file type: ${fileType || getFileExtension(fileName) || "unknown"}`,
        });
        continue;
      }

      const category = getFileCategory(fileType);
      const maxSize = sizeMap[category];
      const fileSizeKB = file.size / 1024;

      if (fileSizeKB > maxSize) {
        skipped.push({
          success: false,
          fileName: file.name,
          error: `File too large (> ${maxSize / 1024} MB)`,
        });
        continue;
      }

      const lf = toLocal(file);
      lf._blobUrl = lf.uri;
      validFiles.push({ file: lf, caption });
    }

    try {
      const signedUrls = await getSignedUrlsWithCaptions(
        validFiles.map(({ file, caption }) => ({ file, caption })),
        parentMessageId
      );

      if (!signedUrls || signedUrls.length === 0) {
        throw new Error("No signed URLs returned from server");
      }

      const results: UploadResult[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        const { file } = validFiles[i];
        const signed = signedUrls[i];

        if (!signed || !signed.url) {
          results.push({
            success: false,
            fileName: file.name,
            error: "Missing signed URL for file",
          });
          continue;
        }

        try {
          const blob = await (await fetch(file.uri)).blob();
          await fetch(signed.url, {
            method: "PUT",
            body: blob,
            headers: {
              "Content-Type": file.type || blob.type || "application/octet-stream",
            },
          });
          results.push({ success: true, fileName: file.name, signed });
        } catch (e: any) {
          results.push({
            success: false,
            fileName: file.name,
            error: e?.message ?? "Upload failed",
            signed,
          });
        }
      }

      const allResults = [...results, ...skipped];

      if (onUploadComplete) {
        await onUploadComplete(allResults);
      }

      return allResults;
    } finally {
      setIsUploadingWebFiles(false);
      validFiles.forEach(({ file }) => {
        try {
          URL.revokeObjectURL(file._blobUrl);
        } catch (err) {
          logWarn("Failed to revoke object URL:", file._blobUrl, err);
        }
      });
    }
  };

  const uploadFilesFromWeb = async (
    files: File[],
    messageText: string = ""
  ): Promise<UploadResult[]> => {
    const filesWithCaptions = files.map((file) => ({
      file,
      caption: messageText,
    }));
    return uploadFilesFromWebWithCaptions(filesWithCaptions);
  };

  return {
    ...hook,
    pickAndUploadImagesAndVideos,
    pickAndUploadDocuments,
    uploadFilesFromWeb,
    uploadFilesFromWebWithCaptions,
    isUploading: isUploadingWebFiles,
    sendGifMessage,
  };
}
