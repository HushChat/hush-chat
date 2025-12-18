import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import axios, { AxiosError } from "axios";
import { CONVERSATION_API_ENDPOINTS, USER_API_ENDPOINTS } from "@/constants/apiConstants";
import { ErrorResponse } from "@/utils/apiErrorUtils";
import { ToastUtils } from "@/utils/toastUtils";
import {
  LocalFile,
  SignedUrl,
  UploadResult,
  useNativePickerUpload,
} from "@/hooks/useNativePickerUpload";
import { createMessagesWithAttachments } from "@/apis/conversation";
import { FileWithCaption } from "@/components/conversations/conversation-thread/message-list/file-upload/FilePreviewOverlay";

export enum UploadType {
  PROFILE = "profile",
  GROUP = "group",
}

export const MAX_IMAGE_KB = 1024 * 5;
const MAX_DOCUMENT_KB = 1024 * 10;

export const ALLOWED_DOCUMENT_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain",
  "application/octet-stream",
  "*/*",
];

const extractSignedUrls = (response: any[]): SignedUrl[] => {
  if (!Array.isArray(response)) return [];
  return response
    .filter((item) => item.signedUrl?.url)
    .map((item) => ({
      originalFileName: item.signedUrl.originalFileName,
      url: item.signedUrl.url,
      indexedFileName: item.signedUrl.indexedFileName,
    }));
};

export const pickAndUploadImage = async (
  id: string,
  fetchData: () => void,
  setUploading: (v: boolean) => void,
  uploadType: UploadType
) => {
  try {
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (pickerResult.canceled || !pickerResult.assets?.[0]) return;

    const asset = pickerResult.assets[0];
    const blob = await (await fetch(asset.uri)).blob();

    if (blob.size / 1024 > MAX_IMAGE_KB) {
      ToastUtils.error("Select an image size below 5MB");
      return;
    }

    const fileName =
      asset.uri.split("/").pop() || (uploadType === UploadType.GROUP ? "group.jpg" : "profile.jpg");
    const endpoint =
      uploadType === UploadType.GROUP
        ? CONVERSATION_API_ENDPOINTS.GROUP_IMAGE_SIGNED_URL(id)
        : USER_API_ENDPOINTS.PROFILE_IMAGE_SIGNED_URL(id);

    const response = await axios.post(endpoint, {
      fileNames: [fileName],
      fileType: asset.type || "image",
    });
    const data = Array.isArray(response.data) ? response.data[0] : response.data;

    await fetch(data.url, { method: "PUT", body: blob, headers: { "Content-Type": blob.type } });
    fetchData();

    return {
      uploadedImageUrl: data.url,
      indexedFileName: data.indexedFileName,
      originalFileName: data.originalFileName,
      pickerResult,
    };
  } catch (error) {
    const axiosError = error as AxiosError<ErrorResponse>;
    ToastUtils.error(axiosError.response?.data?.error || "Upload failed");
  } finally {
    setUploading(false);
  }
};

export function useMessageAttachmentUploader(conversationId: number) {
  const [isUploadingWeb, setIsUploadingWeb] = useState(false);

  const getSignedUrls = async (
    files: LocalFile[],
    messageText = "",
    parentMessageId?: number | null
  ): Promise<SignedUrl[] | null> => {
    const attachments = files.map((file) => ({
      messageText,
      fileName: file.name,
      parentMessageId,
    }));
    const response = await createMessagesWithAttachments(conversationId, attachments);
    return extractSignedUrls(response);
  };

  const hook = useNativePickerUpload(getSignedUrls);

  const pickAndUploadImages = (messageText = "") =>
    hook.pickAndUpload(
      {
        source: "media",
        mediaKind: "image",
        multiple: true,
        maxSizeKB: MAX_IMAGE_KB,
        allowedMimeTypes: ["image/*"],
        allowsEditing: false,
      },
      messageText
    );

  const pickAndUploadDocuments = (messageText = "") =>
    hook.pickAndUpload(
      {
        source: "document",
        multiple: true,
        maxSizeKB: MAX_DOCUMENT_KB,
        allowedMimeTypes: ALLOWED_DOCUMENT_TYPES,
      },
      messageText
    );

  const uploadFilesFromWebWithCaptions = async (
    filesWithCaptions: FileWithCaption[],
    parentMessageId?: number | null
  ): Promise<UploadResult[]> => {
    if (!filesWithCaptions?.length) return [];

    setIsUploadingWeb(true);

    const validFiles: { local: LocalFile; caption: string; blobUrl: string }[] = [];
    const skipped: UploadResult[] = [];

    for (const { file, caption } of filesWithCaptions) {
      const isImage = file.type?.startsWith("image/");
      const isDocument = ALLOWED_DOCUMENT_TYPES.includes(file.type);
      const maxSize = isImage ? MAX_IMAGE_KB : MAX_DOCUMENT_KB;

      if (!isImage && !isDocument) {
        skipped.push({ success: false, fileName: file.name, error: "Unsupported file type" });
        continue;
      }

      if (file.size / 1024 > maxSize) {
        skipped.push({
          success: false,
          fileName: file.name,
          error: `File too large (> ${maxSize / 1024} MB)`,
        });
        continue;
      }

      const blobUrl = URL.createObjectURL(file);
      validFiles.push({
        local: { uri: blobUrl, name: file.name, type: file.type, size: file.size },
        caption,
        blobUrl,
      });
    }

    try {
      const attachments = validFiles.map(({ local, caption }) => ({
        messageText: caption,
        fileName: local.name,
        parentMessageId,
      }));
      const response = await createMessagesWithAttachments(conversationId, attachments);
      const signedUrls = extractSignedUrls(response);

      if (!signedUrls?.length) throw new Error("No signed URLs returned");

      const results: UploadResult[] = [];
      for (let i = 0; i < validFiles.length; i++) {
        const { local } = validFiles[i];
        const signed = signedUrls[i];

        if (!signed?.url) {
          results.push({ success: false, fileName: local.name, error: "Missing signed URL" });
          continue;
        }

        try {
          const blob = await (await fetch(local.uri)).blob();
          await fetch(signed.url, {
            method: "PUT",
            body: blob,
            headers: { "Content-Type": local.type },
          });
          results.push({ success: true, fileName: local.name, signed });
        } catch (e: any) {
          results.push({
            success: false,
            fileName: local.name,
            error: e?.message ?? "Upload failed",
            signed,
          });
        }
      }

      return [...results, ...skipped];
    } finally {
      validFiles.forEach(({ blobUrl }) => URL.revokeObjectURL(blobUrl));
      setIsUploadingWeb(false);
    }
  };

  return {
    ...hook,
    isUploading: hook.isUploading || isUploadingWeb,
    pickAndUploadImages,
    pickAndUploadDocuments,
    uploadFilesFromWebWithCaptions,
  };
}
