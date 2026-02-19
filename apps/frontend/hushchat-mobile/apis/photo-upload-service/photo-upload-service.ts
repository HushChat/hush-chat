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
import { TFileWithCaption } from "@/hooks/conversation-thread/useSendMessageHandler";
import { useEffect, useState } from "react";
import {
  MAX_DOCUMENT_SIZE_KB,
  MAX_IMAGE_SIZE_KB,
  MAX_VIDEO_SIZE_KB,
} from "@/constants/mediaConstants";
import { IMessage } from "@/types/chat/types";
import { getFileType } from "@/utils/files/getFileType";
import { useAttachmentUploadStore } from "@/store/attachmentUpload/useAttachmentUploadStore";
import { PLATFORM } from "@/constants/platformConstants";

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
  isMarkdownEnabled: boolean;
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

export const extractSignedUrls = (response: IMessageWithSignedUrl[] | any): SignedUrl[] => {
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
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const { addPendingId, removePendingIds } = useAttachmentUploadStore();

  useEffect(() => {
    if (!PLATFORM.IS_WEB) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      const pendingCount = useAttachmentUploadStore.getState().pendingMessageIds.size;

      if (pendingCount > 0) {
        event.preventDefault();
        event.returnValue = "Uploads in progress. Changes may not be saved.";
        return event.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);

  const getMessagesWithSignedUrls = async (
    files: LocalFile[],
    messageText: string = "",
    parentMessageId?: number | null,
    isMarkdownEnabled?: boolean
  ): Promise<IMessage[] | null> => {
    const attachments: TAttachmentUploadRequest[] = files.map((file) => ({
      messageText,
      fileName: file.name,
      parentMessageId,
      isMarkdownEnabled: isMarkdownEnabled ?? false,
    }));

    return await createMessagesWithAttachments(conversationId, attachments);
  };

  const getAttachmentsWithCaptions = async (
    filesWithCaptions: { file: LocalFile; caption: string; isMarkdownEnabled: boolean }[],
    parentMessageId?: number | null
  ): Promise<IMessage[] | null> => {
    const attachments: TAttachmentUploadRequest[] = filesWithCaptions.map(
      ({ file, caption, isMarkdownEnabled }) => ({
        messageText: caption,
        fileName: file.name,
        parentMessageId,
        isMarkdownEnabled,
      })
    );

    return await createMessagesWithAttachments(conversationId, attachments);
  };

  const sendGifMessage = async (
    gifUrl: string,
    messageText: string = "",
    parentMessageId?: number | null
  ): Promise<IMessage[]> => {
    const attachments: TAttachmentUploadRequest[] = [
      {
        messageText,
        gifUrl,
        parentMessageId,
        isMarkdownEnabled: false,
      },
    ];

    const response = await createMessagesWithAttachments(conversationId, attachments);
    return response;
  };

  const handleUploadSuccess = async (messageIds: number[]) => {
    await publishMessageEvents(conversationId, messageIds);
  };

  const hook = useNativePickerUpload(getMessagesWithSignedUrls, handleUploadSuccess);

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
    parentMessageId?: number | null,
    onUploadStart?: (pairs: { message: IMessage; file: LocalFile }[]) => void
  ): Promise<UploadResult[]> => {
    if (!filesWithCaptions || filesWithCaptions.length === 0) return [];

    setIsUploadingWebFiles(true);

    const preparedData = filesWithCaptions.map(({ file, caption, isMarkdownEnabled }) => {
      const category = getFileType(file.type);
      const maxSize = sizeMap[category];
      const fileSizeKB = file.size / 1024;

      return {
        file,
        caption,
        isMarkdownEnabled,
        isTooLarge: fileSizeKB > maxSize,
        maxSize,
        localFile: {
          uri: URL.createObjectURL(file),
          name: file.name,
          type: file.type || "application/octet-stream",
          size: file.size,
        } as LocalFile,
      };
    });

    const validEntries = preparedData.filter((d) => !d.isTooLarge);
    const skipped: UploadResult[] = preparedData
      .filter((d) => d.isTooLarge)
      .map((d) => ({
        success: false,
        fileName: d.file.name,
        error: `File too large (> ${d.maxSize / 1024} MB)`,
      }));

    try {
      const messagesWithSignedUrl = await getAttachmentsWithCaptions(
        validEntries.map((d) => ({
          file: d.localFile,
          caption: d.caption,
          isMarkdownEnabled: d.isMarkdownEnabled,
        })),
        parentMessageId
      );

      const signedUrls = extractSignedUrls(messagesWithSignedUrl);
      if (!signedUrls || signedUrls.length === 0) throw new Error("No signed URLs");

      const idsToAdd = signedUrls.map((s) => s.messageId).filter((id): id is number => !!id);
      idsToAdd.forEach((id) => addPendingId(id));

      if (onUploadStart && messagesWithSignedUrl) {
        const optimisticPairs = validEntries
          .map((entry, i) => ({
            message: messagesWithSignedUrl[i],
            file: entry.localFile,
          }))
          .filter((p) => !!p.message);

        onUploadStart(optimisticPairs);
      }

      const uploadPromises = validEntries.map(async (entry, i) => {
        const signed = signedUrls[i];
        const fileKey = signed?.messageId?.toString() ?? i.toString();

        if (!signed?.url) {
          return { success: false, fileName: entry.file.name, error: "No URL" };
        }

        try {
          await axios.put(signed.url, entry.file, {
            headers: { "Content-Type": entry.file.type || "application/octet-stream" },
            onUploadProgress: (event) => {
              const percent = Math.round((event.loaded * 100) / (event.total || entry.file.size));
              setUploadProgress((prev) => ({ ...prev, [fileKey]: percent }));
            },
          });

          if (signed.messageId) {
            await publishMessageEvents(conversationId, [signed.messageId]);
            removePendingIds([signed.messageId]);
          }

          return {
            success: true,
            fileName: entry.file.name,
            messageId: signed.messageId,
            signed,
            newMessage: messagesWithSignedUrl?.find((m) => m.id === signed.messageId),
          };
        } catch (e: any) {
          return { success: false, fileName: entry.file.name, error: e.message, signed };
        }
      });

      const results = await Promise.all(uploadPromises);

      const allResults = [...results, ...skipped];
      if (onUploadComplete) await onUploadComplete(allResults);

      return allResults;
    } finally {
      setIsUploadingWebFiles(false);
      setUploadProgress({});
    }
  };

  const uploadFilesFromWeb = async (
    files: File[],
    messageText: string = "",
    isMarkdownEnabled: boolean
  ): Promise<UploadResult[]> => {
    const filesWithCaptions = files.map((file) => ({
      file,
      caption: messageText,
      isMarkdownEnabled,
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
    uploadProgress,
  };
}
