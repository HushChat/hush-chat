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
import { createMessagesWithAttachments, publishMessageEvents } from "@/apis/conversation";
import { logWarn } from "@/utils/logger";
import { TFileWithCaption } from "@/hooks/conversation-thread/useSendMessageHandler";
import { useState } from "react";
import {
  MAX_DOCUMENT_SIZE_KB,
  MAX_IMAGE_SIZE_KB,
  MAX_VIDEO_SIZE_KB,
} from "@/constants/mediaConstants";
import { IMessage } from "@/types/chat/types";
import { getFileType } from "@/utils/files/getFileType";

export enum UploadType {
  PROFILE = "profile",
  GROUP = "group",
}

export const MAX_IMAGE_KB = 1024 * 5;

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

export interface IMessageWithSignedUrl {
  id: number;
  messageText?: string;
  senderId?: number;
  conversationId?: number;
  createdAt?: string;
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
        messageId: item.id,
      }));
  }
  return [];
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

    const messagesWithSignedUrl = await createMessagesWithAttachments(conversationId, attachments);

    return extractSignedUrls(messagesWithSignedUrl);
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

    const messagesWithSignedUrl = await createMessagesWithAttachments(conversationId, attachments);

    return extractSignedUrls(messagesWithSignedUrl);
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
    return response[0];
  };

  const handleUploadSuccess = async (messageIds: number[]) => {
    await publishMessageEvents(conversationId, messageIds);
  };

  const hook = useNativePickerUpload(getSignedUrls, handleUploadSuccess);

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
        allowedMimeTypes: ["*/*"],
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
      const category = getFileType(file.type);

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
      const successfulMessageIds: number[] = [];

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

          const contentType = file.type || blob.type || "application/octet-stream";

          await fetch(signed.url, {
            method: "PUT",
            body: blob,
            headers: {
              "Content-Type": contentType,
            },
          });
          results.push({
            success: true,
            fileName: file.name,
            signed,
            messageId: signed.messageId,
          });

          if (signed.messageId) {
            successfulMessageIds.push(signed.messageId);
          }
        } catch (e: any) {
          results.push({
            success: false,
            fileName: file.name,
            error: e?.message ?? "Upload failed",
            signed,
          });
        }
      }

      if (successfulMessageIds.length > 0) {
        await publishMessageEvents(conversationId, successfulMessageIds);
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
